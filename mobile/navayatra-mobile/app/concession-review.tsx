import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function ReviewApplication() {
  const router = useRouter();

  // Mock data (later this will come from backend)
  const data = {
    application: {
      no: 'ksrtc-597026',
      date: '25-10-2025',
      collegeStatus: 'APPROVED',
      ksrtcStatus: 'APPROVED',
    },
    personal: {
      name: 'Santhosh Kannan',
      email: 'santhoshathi7@gmail.com',
      dob: '2003-04-30',
      age: '22',
      gender: 'Male',
      guardian: 'Ravidas',
      address: 'Manjumala Puthukad',
      place: 'Vandiperiyar',
      postal: 'Vandiperiyar',
      pincode: '685533',
      district: 'Idukki',
      mobile: '9074033475',
      aadhaar: '********0667',
      rationType: 'BPL',
      rationNo: '1631009417',
    },
    institute: {
      college: 'Marian College Kuttikkanam Autonomous',
      type: 'Self Financing',
      course: 'MCA',
      courseType: 'Unaided',
      duration: '2 Years',
      collegeId: '2356',
      year: '1',
      district: 'Idukki',
    },
    travel: {
      duration: 'Three Month Period',
      depot: 'Kumaly',
      remarks: 'Concession Card',
      from: 'Vandiperiyar',
      to: 'Kuttikkanam',
    },
    files: [
      'Student Photo',
      'ID Card Photo',
      'Aadhaar Card (PDF)',
      'Ration Card (PDF)',
      'Self Declaration Certificate',
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.pageTitle}>APPLICATION REVIEW</Text>

      {/* Application Details */}
      <Section title="APPLICATION DETAILS">
        <Row label="Application No" value={data.application.no} />
        <Row label="Application Date" value={data.application.date} />
        <Row label="College Status" value={data.application.collegeStatus} />
        <Row label="KSRTC Status" value={data.application.ksrtcStatus} />
      </Section>

      {/* Personal Details */}
      <Section title="PERSONAL DETAILS">
        <Row label="Name" value={data.personal.name} />
        <Row label="Email" value={data.personal.email} />
        <Row label="DOB" value={data.personal.dob} />
        <Row label="Age" value={data.personal.age} />
        <Row label="Gender" value={data.personal.gender} />
        <Row label="Guardian Name" value={data.personal.guardian} />
        <Row label="Address" value={data.personal.address} />
        <Row label="Place" value={data.personal.place} />
        <Row label="Postal Name" value={data.personal.postal} />
        <Row label="Pin Code" value={data.personal.pincode} />
        <Row label="District" value={data.personal.district} />
        <Row label="Mobile No" value={data.personal.mobile} />
        <Row label="Aadhaar No" value={data.personal.aadhaar} />
        <Row label="Ration Card Type" value={data.personal.rationType} />
        <Row label="Ration Card No" value={data.personal.rationNo} />
      </Section>

      {/* Institution Details */}
      <Section title="INSTITUTION DETAILS">
        <Row label="College Name" value={data.institute.college} />
        <Row label="College Type" value={data.institute.type} />
        <Row label="Course" value={data.institute.course} />
        <Row label="Course Type" value={data.institute.courseType} />
        <Row label="Course Duration" value={data.institute.duration} />
        <Row label="College ID" value={data.institute.collegeId} />
        <Row label="Current Year" value={data.institute.year} />
        <Row label="District" value={data.institute.district} />
      </Section>

      {/* Travel Details */}
      <Section title="DISTANCE & TRAVEL DETAILS">
        <Row label="Duration" value={data.travel.duration} />
        <Row label="Depot" value={data.travel.depot} />
        <Row label="Remarks" value={data.travel.remarks} />
        <Row label="Travel Route" value={`${data.travel.from}  ⇄  ${data.travel.to}`} />
      </Section>

      {/* Files */}
      <Section title="FILES & IMAGES">
        {data.files.map((file, index) => (
          <Text key={index} style={styles.fileItem}>• {file}</Text>
        ))}
      </Section>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => router.replace('/concession-status')}
      >
        <Text style={styles.submitText}>Confirm & Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* ---------- Reusable Components ---------- */

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: any) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    paddingTop: 40
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  section: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: '#555',
    width: '45%',
  },
  value: {
    fontSize: 13,
    fontWeight: '600',
    width: '55%',
    textAlign: 'right',
  },
  fileItem: {
    fontSize: 13,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 10,
    marginVertical: 20,
    marginBottom: 60,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
