import { PrimarySceneCard } from "@/components/base/scene/PrimarySceneCard"
import { View } from "@/components/ui"
import { BASE_SPACE_HORIZONTAL, GAP_DEVICE_VIEW_MOBILE, GRID_VIEW_DEVICE_MOBILE } from "@/constants"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useWindowDimensions, ScrollView } from "react-native"

type TProps = {
  className?: string
}

export const AutomationListSceneWrapper: React.FC<TProps> = ({ className }) => {
  const layout = useWindowDimensions()
  const cardWidth = (layout.width - BASE_SPACE_HORIZONTAL * 2 - GAP_DEVICE_VIEW_MOBILE) / GRID_VIEW_DEVICE_MOBILE

  return (
    <ScrollView className={className} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Tiêu đề cho Grid */}
      <View className="px-4 mb-3">
        {/* Có thể thêm tựa đề hoặc tuỳ chọn filter ở đây */}
      </View>

      {/* --- GRID (2 CỘT) --- */}
      <View className="w-full flex-row flex-wrap px-4" style={{ gap: GAP_DEVICE_VIEW_MOBILE }}>
        
        {/* 1. Mẫu Cơ Bản: Tối giản (Hình 1) */}
        <PrimarySceneCard
          title="Về nhà"
          cardColor="#FFFFFF"          // Nền thẻ màu trắng
          iconBgColor="#F2FCEE"        // Nền icon xanh lá nhạt
          textColor="#1B1B1B"          // Chữ màu đen
          menuIconColor="#9CA3AF"      // Nút 3 chấm màu xám
          icon={<MaterialCommunityIcons name="home-outline" size={20} color="#84CC16" />}
          containerStyle={{ width: cardWidth }}
        />

        {/* 2. Mẫu Nền Gradient Tươi Sáng & Không nền Icon */}
        <PrimarySceneCard
          title="Thức dậy sớm"
          bgGradient={['#FBBF24', '#F59E0B']} // Vàng sang cam
          textColor="#FFFFFF"                 // Chữ trắng
          menuIconColor="#FFFFFF"
          iconBgColor="transparent"           // Bỏ nền của ô vuông chứa icon
          icon={<MaterialCommunityIcons name="white-balance-sunny" size={24} color="#FFFFFF" />}
          containerStyle={{ width: cardWidth }}
        />

        {/* 3. Mẫu Dark Mode + Quầng sáng Glossy */}
        <PrimarySceneCard
          title="Giải trí (Phim)"
          cardColor="#1F2937"          // Nền xám than đậm
          iconBgColor="#374151"        // Nền icon xám nhạt hơn xíu
          textColor="#F9FAFB"          // Chữ trắng xám
          menuIconColor="#9CA3AF"
          icon={<MaterialCommunityIcons name="movie-open-outline" size={20} color="#A78BFA" />} // Icon màu đỏ dâu/tím
          showGlossyEffect={true}      // BẬT HIỆU ỨNG GLOSSY (Hình 3)
          containerStyle={{ width: cardWidth }}
        />

        {/* 4. Mẫu Nguy Hiểm / Cảnh Báo + Quầng sáng Glossy */}
        <PrimarySceneCard
          title="Báo động"
          cardColor="#7F1D1D"          // Màu đỏ đậm mận
          iconBgColor="#991B1B"        // Đỏ nhạt hơn xíu cho icon box
          textColor="#FFFFFF"
          menuIconColor="#FDA4AF"
          icon={<MaterialCommunityIcons name="shield-alert-outline" size={20} color="#FECACA" />}
          showGlossyEffect={true}      // BẬT HIỆU ỨNG GLOSSY
          containerStyle={{ width: cardWidth }}
        />

        {/* 5. Mẫu Nền Pastel Dành Cho Case Nhẹ Nhàng */}
        <PrimarySceneCard
          title="Đi ngủ"
          cardColor="#EFF6FF"          // Màu xanh dương pastel nhạt
          iconBgColor="#DBEAFE"
          textColor="#1E3A8A"          // Xanh dương đậm
          menuIconColor="#60A5FA"
          icon={<MaterialCommunityIcons name="weather-night" size={20} color="#3B82F6" />}
          containerStyle={{ width: cardWidth }}
        />

        {/* 6. Mẫu Không Có Icon (Chỉ Text) */}
        <PrimarySceneCard
          title="Tắt toàn bộ thiết bị nhà"
          cardColor="#FEE2E2"         // Đỏ cực nhạt (Pastel)
          textColor="#991B1B"         // Chữ đỏ đậm
          menuIconColor="#EF4444"
          icon={null}                 // KHÔNG TRUYỀN ICON ĐỂ BACKGROUND TEXT DỊCH LÊN
          containerStyle={{ width: cardWidth }}
        />
      </View>

      {/* --- BANNER (FULL BỀ NGANG) DÙNG CHO QUẢNG CÁO HOẶC NHẤN MẠNH --- */}
      <View className="px-4 mt-6">
        <PrimarySceneCard
          title="Chế độ Tự động làm mát & Hệ thống sinh thái xanh"
          bgGradient={['#34D399', '#059669']} // Xanh Gradient
          textColor="#FFFFFF"
          menuIconColor="#FFFFFF"
          iconBgColor="rgba(255, 255, 255, 0.2)"
          icon={<MaterialCommunityIcons name="spa-outline" size={24} color="#FFFFFF" />}
          showGlossyEffect={true}
          
          /* Ở đây có thể dùng ảnh ImageSource truyền vào bgPattern. VD:
             bgPattern={require('@/assets/images/leaf-pattern.png')}
             bgPatternStyle={{ opacity: 0.15, right: -20, bottom: -20, width: 120, height: 120 }}
          */

          containerStyle={{ width: '100%', height: 130 }} // Set cứng chiều cao bự hơn
        />
      </View>
    </ScrollView>
  )
}