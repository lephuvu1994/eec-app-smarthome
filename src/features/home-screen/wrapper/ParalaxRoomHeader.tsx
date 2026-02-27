import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

//
// COLORS (Match Apple Home)
//

const COLORS = {
  bgBottom: '#0B0E0D',

  gradientTop: '#31434D',
  gradientMid: '#1E2A2F',

  text: '#FFFFFF',
  textDim: '#B9C2BC',
};

//
// ICON GLOW (HomeKit style)
//

function GlowIcon({ name }: { name: keyof typeof Ionicons.glyphMap }) {
  return (
    <View>

      <Ionicons
        name={name}
        size={28}
        color="#C8FF7C"
        style={styles.glow}
      />

      <Ionicons
        name={name}
        size={28}
        color="#E6FFC7"
      />

    </View>
  );
}

export default function SmartHomeUI() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgBottom }}>

      <StatusBar barStyle="light-content" />

      {/* BASE GRADIENT */}

      <LinearGradient
        colors={[
          COLORS.gradientTop,
          COLORS.gradientMid,
          COLORS.bgBottom,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* RADIAL LIGHT giống HomeKit */}

      <LinearGradient
        colors={[
          'rgba(140,180,200,0.35)',
          'rgba(60,90,110,0.18)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: 'absolute',
          top: -200,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: 300,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          style={{ paddingHorizontal: 20 }}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>

              <Text style={styles.title}>
                Nhà của tôi
              </Text>

              <Feather
                name="chevron-down"
                size={22}
                color="#B6BEBA"
                style={{ marginLeft: 6 }}
              />

            </View>

            <View style={{ flexDirection: 'row', gap: 10 }}>

              <CircleIcon icon="plus" />
              <CircleIcon icon="bell" />

            </View>

          </View>

          {/* SCENES */}

          <SectionHeader title="Kịch bản" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 30 }}
          >

            {['Buổi sáng', 'Buổi tối', 'Ban đêm', 'Dọn dẹp'].map((x, i) => (
              <TouchableOpacity key={i} style={styles.pill}>

                <Text style={styles.pillText}>
                  {x}
                </Text>

              </TouchableOpacity>
            ))}

          </ScrollView>

          {/* QUICK ACCESS */}

          <SectionHeader title="Truy cập nhanh" />

          <View style={styles.quickRow}>

            <Quick icon="bulb-outline" label="Đèn" />
            <Quick icon="camera-outline" label="Camera" />
            <Quick icon="play-outline" label="Media" />
            <Quick icon="leaf-outline" label="Không khí" />

          </View>

          {/* ROOMS */}

          <SectionHeader title="Phòng" />

          <Room
            title="Phòng khách"
            subtitle="6 thiết bị đang bật"
            img="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
          />

          <Room
            title="Nhà bếp"
            subtitle="2 thiết bị đang bật"
            img="https://images.unsplash.com/photo-1556910103-1c02745aae4d"
          />

        </ScrollView>

      </SafeAreaView>

      {/* BOTTOM NAV */}

      <View style={styles.navWrapper}>

        <BlurView
          intensity={70}
          tint="dark"
          style={styles.nav}
        >

          <GlowIcon name="home-outline" />

          <Ionicons name="search-outline" size={26} color="#9FA8A3" />

          <Ionicons name="grid-outline" size={26} color="#9FA8A3" />

          <Feather name="user" size={24} color="#9FA8A3" />

        </BlurView>

      </View>

    </View>
  );
}

//
// COMPONENTS
//

function CircleIcon({ icon }: { icon: keyof typeof Feather.glyphMap }) {
  return (
    <TouchableOpacity style={styles.circle}>

      <Feather name={icon} size={20} color="#FFF" />

    </TouchableOpacity>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={styles.section}>
      {title}
    </Text>
  );
}

function Quick({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (

    <TouchableOpacity style={styles.quick}>

      <LinearGradient
        colors={[
          'rgba(170,255,110,0.18)',
          'rgba(170,255,110,0.05)',
          'rgba(255,255,255,0.04)',
        ]}
        style={StyleSheet.absoluteFill}
      />

      <GlowIcon name={icon} />

      <Text style={styles.quickText}>
        {label}
      </Text>

    </TouchableOpacity>

  );
}

function Room({ title, subtitle, img }: { title: string; subtitle: string; img: string }) {
  return (

    <TouchableOpacity style={styles.room}>

      <Image
        source={{ uri: img }}
        style={styles.roomImg}
      />

      <BlurView
        intensity={55}
        tint="dark"
        style={styles.roomGlass}
      >

        <View>

          <Text style={styles.roomTitle}>
            {title}
          </Text>

          <Text style={styles.roomSub}>
            {subtitle}
          </Text>

        </View>

        <View style={styles.arrow}>
          <Feather name="arrow-right" size={20} color="#FFF" />
        </View>

      </BlurView>

    </TouchableOpacity>

  );
}

//
// STYLES
//

const styles = StyleSheet.create({

  header: {
    marginTop: 20,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: '500',
    color: '#FFF',
  },

  section: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFF',
    marginBottom: 14,
  },

  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,

    backgroundColor: 'rgba(255,255,255,0.15)',

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.1)',

    borderTopColor: 'rgba(255,255,255,0.35)',

    alignItems: 'center',
    justifyContent: 'center',
  },

  pill: {

    paddingHorizontal: 20,
    paddingVertical: 10,

    borderRadius: 25,

    marginRight: 10,

    backgroundColor: 'rgba(255,255,255,0.08)',

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.05)',

    borderTopColor: 'rgba(255,255,255,0.18)',

  },

  pillText: {
    color: '#C5CEC9',
  },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },

  quick: {

    width: (width - 40 - 36) / 4,

    aspectRatio: 1,

    borderRadius: 18,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.08)',

    borderTopColor: 'rgba(255,255,255,0.18)',

    alignItems: 'center',
    justifyContent: 'center',

  },

  quickText: {
    marginTop: 6,
    fontSize: 12,
    color: '#C8D0CC',
  },

  glow: {
    position: 'absolute',
    textShadowColor: '#C8FF7C',
    textShadowRadius: 14,
    opacity: 0.45,
  },

  room: {

    height: 200,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,

  },

  roomImg: {
    width: '100%',
    height: '100%',
  },

  roomGlass: {

    position: 'absolute',

    bottom: 0,
    left: 0,
    right: 0,

    height: 95,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    paddingHorizontal: 20,

    backgroundColor: 'rgba(80,90,95,0.35)',

  },

  roomTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '600',
  },

  roomSub: {
    color: '#C5CCC8',
    marginTop: 4,
  },

  arrow: {

    width: 42,
    height: 42,
    borderRadius: 21,

    backgroundColor: 'rgba(255,255,255,0.18)',

    alignItems: 'center',
    justifyContent: 'center',

  },

  navWrapper: {

    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,

  },

  nav: {

    flexDirection: 'row',

    justifyContent: 'space-around',

    paddingVertical: 16,

    borderRadius: 40,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor: 'rgba(255,255,255,0.15)',

    borderTopColor: 'rgba(255,255,255,0.35)',

    backgroundColor: 'rgba(120,140,150,0.25)',

  },

});
