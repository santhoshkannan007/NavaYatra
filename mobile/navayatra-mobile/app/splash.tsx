import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const busAssets = [
  require('../assets/images/bus.png'),
  require('../assets/images/bus2.png'),
  require('../assets/images/bus3.png'),
  require('../assets/images/bus4.png'),
  require('../assets/images/bus5.png'),
  require('../assets/images/bus6.png'),
  require('../assets/images/bus7.png'),
  require('../assets/images/bus8.png'),
  require('../assets/images/bus9.png'),
  require('../assets/images/bus10.png'),
  require('../assets/images/bus11.png'),
  require('../assets/images/bus12.png'),
];

const particleOffsets = [-120, -80, -30, 20, 70, 120];
const titleChars = 'NAVAYATRA'.split('');

export default function SplashScreen() {
  const router = useRouter();
  const busMotion = useRef(busAssets.map(() => new Animated.Value(0))).current;
  const busFloat = useRef(new Animated.Value(0)).current;
  const introProgress = useRef(new Animated.Value(0)).current;
  const routeProgress = useRef(new Animated.Value(0)).current;
  const particleMotion = useRef(particleOffsets.map(() => new Animated.Value(0))).current;
  const titleMotion = useRef(titleChars.map(() => new Animated.Value(0))).current;
  const titleShimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const introAnimation = Animated.timing(introProgress, {
      toValue: 1,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    const routeAnimation = Animated.timing(routeProgress, {
      toValue: 1,
      duration: 1300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    const animations = busMotion.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 180),
          Animated.timing(value, {
            toValue: 1,
            duration: 2200 + index * 90,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(120),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      )
    );

    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(busFloat, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(busFloat, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const particles = particleMotion.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(value, {
            toValue: 1,
            duration: 1800 + index * 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 1800 + index * 120,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      )
    );

    const titleReveal = Animated.stagger(
      70,
      titleMotion.map((value) =>
        Animated.timing(value, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      )
    );

    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.delay(500),
        Animated.timing(titleShimmer, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(titleShimmer, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    animations.forEach((animation) => animation.start());
    floatAnimation.start();
    particles.forEach((animation) => animation.start());
    introAnimation.start();
    routeAnimation.start();
    titleReveal.start();
    shimmerAnimation.start();

    const timer = setTimeout(() => {
      router.replace('/'); // navigate to login (index.tsx)
    }, 2500);

    return () => {
      clearTimeout(timer);
      animations.forEach((animation) => animation.stop());
      particles.forEach((animation) => animation.stop());
      introAnimation.stop();
      routeAnimation.stop();
      floatAnimation.stop();
      titleReveal.stop();
      shimmerAnimation.stop();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* 🎆 Firework Top Left */}
      <LottieView
        source={require('../assets/lottie/fire1.json')}
        autoPlay
        loop
        style={styles.fireworkTopLeft}
      />

      {/* 🎆 Firework Bottom Right */}
      <LottieView
        source={require('../assets/lottie/fire1.json')}
        autoPlay
        loop
        style={styles.fireworkBottomRight}
      />

      <View style={styles.logoWrap}>
        <View style={styles.logoRow}>
          {titleChars.map((char, index) => (
            <Animated.Text
              key={`${char}-${index}`}
              style={[
                styles.logoLetter,
                {
                  opacity: titleMotion[index],
                  transform: [
                    {
                      translateY: titleMotion[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [28, 0],
                      }),
                    },
                    {
                      scaleY: titleMotion[index].interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [1.4, 0.95, 1],
                      }),
                    },
                    {
                      scaleX: titleMotion[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.7, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {char}
            </Animated.Text>
          ))}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.titleShimmer,
            {
              transform: [
                {
                  translateX: titleShimmer.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-220, 220],
                  }),
                },
                { rotate: '18deg' },
              ],
            },
          ]}
        />
      </View>

      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: introProgress,
            transform: [
              {
                translateY: introProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          },
        ]}
      >
        Smart Journey for Kerala
      </Animated.Text>

      <Animated.View
        style={[
          styles.routeLine,
          {
            opacity: introProgress,
            transform: [
              {
                scaleX: routeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.routeDot} />
        <View style={styles.routeDot} />
        <View style={styles.routeDot} />
      </Animated.View>

      {particleMotion.map((value, index) => (
        <Animated.View
          key={`particle-${index}`}
          style={[
            styles.particle,
            {
              left: `${18 + index * 13}%`,
              top: `${10 + (index % 3) * 9}%`,
              opacity: value.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.15, 0.85, 0.15],
              }),
              transform: [
                {
                  translateY: value.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, index % 2 === 0 ? -24 : 24],
                  }),
                },
                {
                  scale: value.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.65, 1.1, 0.65],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <View style={styles.busLane}>
        {busMotion.map((value, index) => {
          const translateX = value.interpolate({
            inputRange: [0, 1],
            outputRange: [-SCREEN_WIDTH * 0.35, SCREEN_WIDTH * 1.05],
          });

          const laneOffset = index % 3 === 0 ? 0 : index % 3 === 1 ? 16 : 32;
          const busScale = index % 4 === 0 ? 1 : index % 4 === 1 ? 0.92 : index % 4 === 2 ? 1.04 : 0.86;
          const busOpacity = index < 5 ? 0.9 : 0.65;

          return (
            <Animated.Image
              key={`bus-${index}`}
              source={busAssets[index]}
              style={[
                styles.movingBus,
                {
                  opacity: busOpacity,
                  transform: [
                    { translateX },
                    {
                      translateY: busFloat.interpolate({
                        inputRange: [0, 1],
                        outputRange: [laneOffset, laneOffset - 6],
                      }),
                    },
                    { scale: busScale },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      <Animated.View
        style={[
          styles.centerGlow,
          {
            opacity: busFloat.interpolate({
              inputRange: [0, 1],
              outputRange: [0.6, 1],
            }),
            transform: [
              {
                scale: busFloat.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1.04],
                }),
              },
            ],
          },
        ]}
      />

      {/* 🎉 Welcome Animation */}
      <LottieView
        source={require('../assets/lottie/Welcome.json')}
        autoPlay
        loop
        style={styles.welcomeAnimation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C62828',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logoWrap: {
    position: 'relative',
    marginBottom: 6,
    overflow: 'hidden',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  logoLetter: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1.4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },

  titleShimmer: {
    position: 'absolute',
    top: -12,
    bottom: -12,
    width: 32,
    backgroundColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },

  tagline: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },

  routeLine: {
    width: '72%',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.36)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 8,
  },

  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },

  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  busLane: {
    width: '100%',
    height: 170,
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 10,
    marginBottom: 20,
  },

  movingBus: {
    position: 'absolute',
    width: 96,
    height: 96,
    resizeMode: 'contain',
  },

  centerGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#ffffff',
    shadowOpacity: 0.35,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },

  fireworkTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 120,
    height: 120,
  },

  fireworkBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 120,
    height: 120,
  },

  welcomeAnimation: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
});
