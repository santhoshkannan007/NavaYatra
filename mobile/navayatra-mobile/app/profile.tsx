import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import API from '@/services/api';


/* ---------------------------
   User Type
---------------------------- */

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  wallet_refund_balance: number | string;
}

interface WalletTransaction {
  id: number;
  booking_id: number | null;
  tx_type: 'CREDIT_REFUND' | 'DEBIT_BOOKING';
  amount: number | string;
  note: string;
  created_at: string;
}

interface BookingNotification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/* ---------------------------
   Ticket Type
---------------------------- */

interface Ticket {
  booking_id: number;
  bus: string;
  pickup: string;
  dropoff: string;
  date: string;
  status: string;
  total_fare: number | string;
  refund_amount: number | string;
  refund_percentage: number;
  can_cancel: boolean;
  hours_until_departure: number;
  estimated_refund_percentage: number;
  estimated_refund: number | string;
  cancelled_at?: string | null;
}

// This type is currently unused but can be helpful for future features related to special tours.
interface Tour {
  id: number
  tour_type: string
  from: string
  to: string
  start_date: string
  bus_type: string
  passenger_count: number
  status: string
  estimated_price: number
  payment_status: string
}

export default function ProfileScreen() {

  const router = useRouter();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];

  const [user, setUser] = useState<User | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [tours,setTours] = useState<Tour[]>([]);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showTickets, setShowTickets] = useState(true);
  const [showTours, setShowTours] = useState(true);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [notifications, setNotifications] = useState<BookingNotification[]>([]);


  /* ---------------------------
     Fetch Profile
  ---------------------------- */

  const fetchProfile = async () => {

    try {

      const token = await AsyncStorage.getItem("accessToken");

      const response = await API.get("/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUser(response.data);

    } catch (error) {

      const err = error as AxiosError<any>;
      console.log("Profile Error:", err.response?.data || err.message);

    }
  };


  /* ---------------------------
     Fetch Tickets
  ---------------------------- */

  const fetchTickets = async () => {

    try {

      const token = await AsyncStorage.getItem("accessToken");

      const response = await API.get("/booking/my-tickets/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTickets(response.data);
      // console.log("Tickets API:", response.data);

    } catch (error) {
      
      console.log("Ticket Error:", error);

    } finally {

      setLoading(false);

    }
  };

  const fetchWalletSummary = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await API.get('/booking/wallet/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setWalletTransactions(response.data?.transactions || []);
    } catch (error) {
      console.log('Wallet summary error:', error);
      setWalletTransactions([]);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await API.get('/booking/notifications/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications(response.data || []);
    } catch (error) {
      console.log('Notifications error:', error);
      setNotifications([]);
    }
  };

  const formatMoney = (value: number | string | undefined) => {
    const amount = typeof value === "string" ? parseFloat(value) : value || 0;
    return amount.toFixed(2);
  };

  const cancelTicket = async (ticket: Ticket) => {

    Alert.alert(
      "Cancel ticket",
      `Cancel booking #${ticket.booking_id}? Refund depends on hours before departure.`,
      [
        {
          text: "No",
          style: "cancel"
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              setCancellingId(ticket.booking_id);

              const token = await AsyncStorage.getItem("accessToken");

              const res = await API.post(
                `/booking/cancel/${ticket.booking_id}/`,
                {
                  reason: "Cancelled from user profile"
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`
                  }
                }
              );

              const updatedTicket = res.data.ticket;
              setTickets((prev) =>
                prev.map((t) =>
                  t.booking_id === updatedTicket.booking_id ? updatedTicket : t
                )
              );

              setUser((prev) => {
                if (!prev) {
                  return prev;
                }

                const currentWallet = typeof prev.wallet_refund_balance === 'string'
                  ? parseFloat(prev.wallet_refund_balance)
                  : prev.wallet_refund_balance || 0;

                const refund = typeof res.data?.refund?.refund_amount === 'string'
                  ? parseFloat(res.data.refund.refund_amount)
                  : res.data?.refund?.refund_amount || 0;

                return {
                  ...prev,
                  wallet_refund_balance: currentWallet + refund,
                };
              });

              Alert.alert(
                "Ticket cancelled",
                `Refund: ${res.data.refund.refund_percentage}% (Rs. ${formatMoney(res.data.refund.refund_amount)})`
              );

            } catch (error: any) {
              const msg = error?.response?.data?.error || "Failed to cancel ticket";
              Alert.alert("Cancellation failed", msg);
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

   /* ---------------------------
     Fetch Special Tours
  ---------------------------- */
  const fetchTours = async () => {

  try{

    const token = await AsyncStorage.getItem("accessToken");

    const res = await API.get(
      "/special-tour/my-tours/",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    setTours(res.data);

  }catch(error){

    console.log("Tour Error:",error);

  }

};


  useEffect(()=>{
  fetchProfile();
  fetchTickets();
  fetchTours();
  fetchWalletSummary();
  fetchNotifications();
  },[]);

  const activeBookings = tickets.filter((ticket) => ticket.status === 'CONFIRMED').length;
  const pendingTours = tours.filter((tour) => tour.status === 'APPROVED' && tour.payment_status !== 'PAID').length;
  const profileStats = [
    { label: 'Tickets', value: tickets.length, icon: 'ticket-outline' },
    { label: 'Active', value: activeBookings, icon: 'time-outline' },
    { label: 'Tours', value: tours.length, icon: 'bus-outline' },
    { label: 'Pending', value: pendingTours, icon: 'card-outline' },
  ];


  /* ---------------------------
     Logout
  ---------------------------- */

  const handleLogout = async () => {

    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");

    router.replace('/');

  };


  /* ---------------------------
     Download Ticket PDF
  ---------------------------- */

  const downloadPDF = async (ticket: Ticket) => {

  try {

    const token = await AsyncStorage.getItem("accessToken");

    const response = await API.get(
      `/booking/ticket/${ticket.booking_id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = response.data;

    const qrData = JSON.stringify({
      booking_id: data.booking_id,
      bus: data.bus,
      date: data.date,
      pickup: data.pickup,
      dropoff: data.dropoff
    });

    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

    const passengersHTML = data.passengers
      .map(
        (p: any, i: number) => `
        <tr>
          <td>${i + 1}</td>
          <td>${p.name}</td>
          <td>${p.age}</td>
          <td>${p.gender}</td>
          <td>${p.seat}</td>
        </tr>
      `
      )
      .join("");

    const html = `
    <html>
    <head>

    <style>

    body{
      font-family: Arial;
      padding: 30px;
    }

    .header{
      text-align:center;
      margin-bottom:30px;
    }

    .title{
      font-size:28px;
      font-weight:bold;
      color:#C62828;
    }

    .section{
      margin-top:20px;
      margin-bottom:10px;
      font-weight:bold;
      font-size:18px;
    }

    table{
      width:100%;
      border-collapse:collapse;
      margin-top:10px;
    }

    th, td{
      border:1px solid #ddd;
      padding:8px;
      text-align:left;
    }

    th{
      background:#f5f5f5;
    }

    .box{
      border:1px solid #ddd;
      padding:15px;
      border-radius:6px;
      margin-top:10px;
    }

    .qr{
      text-align:center;
      margin-top:30px;
    }

    </style>

    </head>

    <body>

    <div class="header">

      <div class="title">NavaYatra Bus Ticket</div>
      <p>Digital Travel Ticket</p>

    </div>

    <div class="box">

      <div class="section">Booking Information</div>

      <p><b>Booking ID:</b> ${data.booking_id}</p>
      <p><b>Status:</b> ${data.status}</p>
      <p><b>Travel Date:</b> ${data.date}</p>

    </div>

    <div class="box">

      <div class="section">Bus Information</div>

      <p><b>Bus Number:</b> ${data.bus}</p>
      <p><b>From:</b> ${data.pickup}</p>
      <p><b>To:</b> ${data.dropoff}</p>

    </div>

    <div class="box">

      <div class="section">Passenger Details</div>

      <table>

        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Age</th>
          <th>Gender</th>
          <th>Seat</th>
        </tr>

        ${passengersHTML}

      </table>

    </div>

    <div class="box">

      <div class="section">Contact Information</div>

      <p><b>Phone:</b> ${data.phone}</p>
      <p><b>Email:</b> ${data.email}</p>

    </div>

    <div class="qr">

      <img src="${qrURL}" width="180" height="180"/>

      <p>Scan this QR while boarding</p>

    </div>

    <p style="margin-top:40px;text-align:center;color:gray;">
      Thank you for choosing NavaYatra.
    </p>

    </body>
    </html>
    `;

    const file = await Print.printToFileAsync({ html });

    await Sharing.shareAsync(file.uri);

  } catch (error) {

    console.log("PDF Error:", error);

  }

};


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C62828" />
      </View>
    );
  }


  return (

    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >


      {/* Profile Section */}

      <View style={[styles.heroCard, { backgroundColor: palette.surface, borderColor: palette.border }]}> 
        <View style={styles.heroHeader}>
          <View style={[styles.avatarWrap, { backgroundColor: palette.primarySoft }]}>
            <Ionicons name="person-circle-outline" size={66} color={palette.primary} />
          </View>
          <View style={[styles.badge, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
            <Text style={[styles.badgeText, { color: palette.muted }]}>User dashboard</Text>
          </View>
        </View>

        <Text style={[styles.name, { color: palette.text }]}>
          {user?.first_name} {user?.last_name}
        </Text>

        <Text style={[styles.heroCopy, { color: palette.muted }]}>Manage tickets, refunds, and special tour requests from one elegant place.</Text>

        <View style={[styles.walletCard, { backgroundColor: palette.primarySoft, borderColor: palette.border }]}> 
          <View style={styles.walletHeaderRow}>
            <Ionicons name="wallet-outline" size={18} color={palette.primary} />
            <Text style={[styles.walletLabel, { color: palette.primary }]}>Refund Wallet</Text>
          </View>
          <Text style={[styles.walletAmount, { color: palette.text }]}>Rs. {formatMoney(user?.wallet_refund_balance)}</Text>
          <Text style={[styles.walletCaption, { color: palette.muted }]}>Only your cancelled-ticket refunds are added here.</Text>
        </View>

        {walletTransactions.length > 0 && (
          <View style={[styles.walletLedgerCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
            <Text style={[styles.walletLedgerTitle, { color: palette.text }]}>Wallet History</Text>

            {walletTransactions.slice(0, 5).map((tx) => (
              <View key={tx.id} style={styles.walletTxRow}>
                <Text style={[styles.walletTxType, { color: palette.text }]}>
                  {tx.tx_type === 'CREDIT_REFUND' ? 'Refund Credit' : 'Booking Debit'}
                </Text>
                <Text style={[styles.walletTxAmount, { color: tx.tx_type === 'CREDIT_REFUND' ? '#2E7D32' : '#C62828' }]}>
                  {tx.tx_type === 'CREDIT_REFUND' ? '+' : '-'}Rs. {formatMoney(tx.amount)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {notifications.length > 0 && (
          <View style={[styles.walletLedgerCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
            <Text style={[styles.walletLedgerTitle, { color: palette.text }]}>Recent Alerts</Text>
            {notifications.slice(0, 4).map((n) => (
              <View key={n.id} style={styles.notificationRow}>
                <Text style={[styles.notificationTitle, { color: palette.text }]}>{n.title}</Text>
                <Text style={[styles.notificationMessage, { color: palette.muted }]}>{n.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.metaGrid}>
          <View style={[styles.metaChip, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
            <Text style={[styles.metaLabel, { color: palette.muted }]}>Username</Text>
            <Text style={[styles.metaValue, { color: palette.text }]} numberOfLines={1}>{user?.username}</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
            <Text style={[styles.metaLabel, { color: palette.muted }]}>Email</Text>
            <Text style={[styles.metaValue, { color: palette.text }]} numberOfLines={1}>{user?.email}</Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
            <Text style={[styles.metaLabel, { color: palette.muted }]}>Phone</Text>
            <Text style={[styles.metaValue, { color: palette.text }]} numberOfLines={1}>{user?.phone}</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          {profileStats.map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
              <Ionicons name={item.icon as any} size={16} color={palette.primary} />
              <Text style={[styles.statValue, { color: palette.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: palette.muted }]}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: palette.primary }]} onPress={() => router.push('/ticket-search')}>
            <Text style={styles.actionButtonText}>Book again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]} onPress={() => router.push('/search')}>
            <Text style={[styles.actionButtonText, { color: palette.text }]}>Search buses</Text>
          </TouchableOpacity>
        </View>

      </View>


      {/* My Tickets Section */}

      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowTickets((prev) => !prev)}
      >
        <Text style={styles.sectionTitle}>My Tickets</Text>
        <Ionicons
          name={showTickets ? "chevron-up" : "chevron-down"}
          size={20}
          color="#1f2937"
        />
      </TouchableOpacity>

      {showTickets && (
        <View style={[styles.refundPolicyCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}> 
          <Text style={[styles.refundPolicyTitle, { color: palette.text }]}>Refund Policy</Text>
          <Text style={[styles.refundPolicyText, { color: palette.muted }]}>24+ hrs: 90% refund</Text>
          <Text style={[styles.refundPolicyText, { color: palette.muted }]}>6 to less than 24 hrs: 50% refund</Text>
          <Text style={[styles.refundPolicyText, { color: palette.muted }]}>2 to less than 6 hrs: 25% refund</Text>
          <Text style={[styles.refundPolicyText, { color: palette.muted }]}>Less than 2 hrs: 0% refund</Text>
        </View>
      )}

      {showTickets && tickets.length === 0 && (
        <Text style={[styles.emptyState, { color: palette.muted }]}> 
          No bookings yet
        </Text>
      )}

      {showTickets && tickets.map((ticket) => (

        <View key={ticket.booking_id} style={styles.ticketCard}>

          <Text style={styles.ticketText}>
            Bus: {ticket.bus}
          </Text>

          <Text style={styles.ticketText}>
            {ticket.pickup} → {ticket.dropoff}
          </Text>

          <Text style={styles.ticketText}>
            Date: {ticket.date}
          </Text>

          <Text style={styles.ticketText}>
            Status: {ticket.status}
          </Text>

          <Text style={styles.ticketText}>
            Fare: Rs. {formatMoney(ticket.total_fare)}
          </Text>

          {ticket.status === "CONFIRMED" && ticket.can_cancel && (
            <Text style={styles.refundHint}>
              Cancel now: {ticket.estimated_refund_percentage}% refund (Rs. {formatMoney(ticket.estimated_refund)}) | {ticket.hours_until_departure.toFixed(1)} hrs left
            </Text>
          )}

          {ticket.status === "CANCELLED" && (
            <Text style={styles.cancelledText}>
              Refunded: {ticket.refund_percentage}% (Rs. {formatMoney(ticket.refund_amount)})
            </Text>
          )}

          <View style={styles.buttonRow}>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() =>
                router.push({
                  pathname: "/ticket",
                  params: { booking_id: ticket.booking_id }
                })
              }
            >
              <Text style={styles.buttonText}>View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => downloadPDF(ticket)}
            >
              <Text style={styles.buttonText}>PDF</Text>
            </TouchableOpacity>

            {ticket.status === "CONFIRMED" && ticket.can_cancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelTicket(ticket)}
                disabled={cancellingId === ticket.booking_id}
              >
                <Text style={styles.buttonText}>
                  {cancellingId === ticket.booking_id ? "Cancelling..." : "Cancel"}
                </Text>
              </TouchableOpacity>
            )}

          </View>

        </View>

      ))}

      {/* My Special Tours */}

      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowTours((prev) => !prev)}
      >
        <Text style={styles.sectionTitle}>My Tours</Text>
        <Ionicons
          name={showTours ? "chevron-up" : "chevron-down"}
          size={20}
          color="#1f2937"
        />
      </TouchableOpacity>

      {showTours && tours.length === 0 && (
        <Text style={[styles.emptyState, { color: palette.muted }]}> 
          No tour requests
        </Text>
      )}

      {showTours && tours.map((tour)=>(
        
      <View key={tour.id} style={styles.ticketCard}>

      <Text style={styles.ticketText}>
      Tour: {tour.tour_type}
      </Text>

      <Text style={styles.ticketText}>
      {tour.from} → {tour.to}
      </Text>

      <Text style={styles.ticketText}>
      Date: {tour.start_date}
      </Text>

      <Text style={styles.ticketText}>
      Passengers: {tour.passenger_count}
      </Text>

      <Text style={styles.ticketText}>
      Status: {tour.status}
      </Text>


      {/* APPROVED BUT NOT PAID */}

      {tour.status === "APPROVED" && tour.payment_status !== "PAID" && (

      <TouchableOpacity
      style={styles.viewButton}
      onPress={()=>router.push({
      pathname:"/tour-payment",
      params:{
      tour_id:tour.id,
      price:tour.estimated_price
      }
      })}
      >

      <Text style={styles.buttonText}>
      Pay ₹{tour.estimated_price}
      </Text>

      </TouchableOpacity>

      )}


      {/* PAID */}

      {tour.status === "APPROVED" && tour.payment_status === "PAID" && (

      <TouchableOpacity
      style={styles.downloadButton}
      onPress={()=>router.push({
      pathname:"/tour-ticket",
      params:{tour_id:tour.id}
      })}
      >

      <Text style={styles.buttonText}>
      View Tour Ticket
      </Text>

      </TouchableOpacity>

      )}

      </View>

      ))}


      {/* Logout */}

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: palette.primary }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

    </ScrollView>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  contentContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 36,
    paddingBottom: 48,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },

  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
  },

  heroCopy: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },

  walletCard: {
    marginTop: 14,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
  },

  walletHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  walletLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  walletAmount: {
    fontSize: 22,
    fontWeight: '800',
  },

  walletCaption: {
    fontSize: 12,
    fontWeight: '600',
  },

  walletLedgerCard: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },

  walletLedgerTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  walletTxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  walletTxType: {
    fontSize: 12,
    fontWeight: '700',
  },

  walletTxAmount: {
    fontSize: 12,
    fontWeight: '800',
  },

  notificationRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9E5',
  },

  notificationTitle: {
    fontSize: 12,
    fontWeight: '800',
  },

  notificationMessage: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },

  metaGrid: {
    marginTop: 16,
    gap: 10,
  },

  metaChip: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  metaValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },

  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionButtonText: {
    fontWeight: '800',
    fontSize: 13,
  },

  info: {
    fontSize: 16,
    marginTop: 6,
    color: '#555',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },

  refundPolicyCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },

  refundPolicyTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },

  refundPolicyText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },

  ticketCard: {
    backgroundColor: '#F9F9F9',
    padding: 15,
    borderRadius: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ECE7E4',
  },

  ticketText: {
    fontSize: 14,
    marginBottom: 3,
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },

  viewButton: {
    backgroundColor: '#2E7D32',
    padding: 10,
    borderRadius: 10,
  },

  downloadButton: {
    backgroundColor: '#1565C0',
    padding: 10,
    borderRadius: 10,
  },

  cancelButton: {
    backgroundColor: '#C62828',
    padding: 10,
    borderRadius: 10,
  },

  refundHint: {
    marginTop: 6,
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },

  cancelledText: {
    marginTop: 6,
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  logoutButton: {
    marginTop: 20,
    backgroundColor: '#C62828',
    padding: 14,
    borderRadius: 16,
  },

  logoutText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  emptyState: {
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
  },
});