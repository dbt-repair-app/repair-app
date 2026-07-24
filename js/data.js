// Data Configuration for DBT Computer Repair System (แผนกเทคโนโลยีธุรกิจดิจิทัล)

const INITIAL_DATA = {
  // บัญชีเริ่มต้นระบบ (บัญชีผู้ดูแลระบบ Admin หลัก)
  users: [
    { 
      id: "admin-01", 
      name: "ผู้ดูแลระบบไอที (Admin)", 
      role: "admin",
      userType: "admin",
      userTypeLabel: "เจ้าหน้าที่ไอที / Admin",
      email: "admin@dbt.ac.th",
      password: "123",
      department: "ผู้ดูแลระบบแจ้งซ่อมไอทีประจำแผนก",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" 
    }
  ],

  // รายชื่อห้องเรียน 121 ถึง 127
  rooms: [
    { id: "121", name: "ห้อง 121 - ห้องปฏิบัติการคอมพิวเตอร์ 121", totalPcs: 24, description: "เครื่อง PC สำหรับการเรียนการสอนและปฏิบัติการไอที" },
    { id: "122", name: "ห้อง 122 - ห้องปฏิบัติการคอมพิวเตอร์ 122", totalPcs: 24, description: "เครื่อง PC สำหรับการเขียนโค้ดและพัฒนาซอฟต์แวร์" },
    { id: "123", name: "ห้อง 123 - ห้องปฏิบัติการคอมพิวเตอร์ 123", totalPcs: 24, description: "เครื่อง PC สำหรับงานกราฟิกและสื่อดิจิทัล" },
    { id: "124", name: "ห้อง 124 - ห้องปฏิบัติการคอมพิวเตอร์ 124", totalPcs: 24, description: "เครื่อง PC ปฏิบัติการเครือข่ายคอมพิวเตอร์" },
    { id: "125", name: "ห้อง 125 - ห้องปฏิบัติการคอมพิวเตอร์ 125", totalPcs: 24, description: "เครื่อง PC สำหรับระบบฐานข้อมูลและธุรกิจดิจิทัล" },
    { id: "126", name: "ห้อง 126 - ห้องปฏิบัติการคอมพิวเตอร์ 126", totalPcs: 24, description: "เครื่อง PC สำหรับมัลติมีเดียและแอนิเมชัน" },
    { id: "127", name: "ห้อง 127 - ห้องปฏิบัติการคอมพิวเตอร์ 127", totalPcs: 24, description: "เครื่อง PC ปฏิบัติการพาณิชย์ดิจิทัลและแอปพลิเคชัน" }
  ],

  categories: [
    { id: "power", name: "เปิดไม่ติด", icon: "power", badge: "bg-red-500/10 text-red-500 border-red-500/20" },
    { id: "internet", name: "อินเทอร์เน็ตใช้ไม่ได้", icon: "wifi-off", badge: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { id: "slow", name: "เครื่องช้า", icon: "gauge", badge: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    { id: "bsod", name: "จอฟ้า", icon: "monitor-off", badge: "bg-blue-600/10 text-blue-500 border-blue-600/20" },
    { id: "mouse", name: "เมาส์เสีย", icon: "mouse-pointer", badge: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "keyboard", name: "คีย์บอร์ดเสีย", icon: "keyboard", badge: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    { id: "printer", name: "เครื่องพิมพ์เสีย", icon: "printer", badge: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    { id: "other", name: "อื่นๆ", icon: "help-circle", badge: "bg-gray-500/10 text-gray-400 border-gray-500/20" }
  ],

  statuses: {
    pending: { label: "รอตรวจสอบ", color: "amber", icon: "clock", symbol: "🟡", bg: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    in_progress: { label: "กำลังดำเนินการ", color: "blue", icon: "wrench", symbol: "🔵", bg: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    completed: { label: "ซ่อมเสร็จ", color: "emerald", icon: "check-circle-2", symbol: "🟢", bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    external: { label: "ส่งซ่อมภายนอก", color: "red", icon: "truck", symbol: "🔴", bg: "bg-rose-500/15 text-rose-400 border-rose-500/30" },
    cancelled: { label: "ยกเลิก", color: "neutral", icon: "x-circle", symbol: "⚫", bg: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30" }
  },

  urgencies: {
    low: { label: "เล็กน้อย", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    medium: { label: "ปกติ", color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    high: { label: "ด่วน", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    critical: { label: "ด่วนมาก", color: "text-rose-400 bg-rose-500/10 border-rose-500/30 animate-pulse" }
  },

  // ลบตัวอย่างใบแจ้งซ่อมออกทั้งหมด เริ่มต้นด้วยระบบว่างเปล่า
  tickets: []
};
