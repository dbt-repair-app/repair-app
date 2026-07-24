// Charts & Analytics Module for DBT Computer Repair System using Chart.js

let roomChartInstance = null;
let categoryChartInstance = null;
let techChartInstance = null;

function renderAnalyticsCharts(tickets, rooms, categories, users) {
  if (typeof Chart === 'undefined') return;

  // Chart defaults for Dark Mode
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.font.family = 'Kanit';

  // 1. ห้องไหนเสียบ่อย (Bar Chart)
  const roomCounts = {};
  rooms.forEach(r => roomCounts[r.name.split(' ')[1] || r.id] = 0);
  
  tickets.forEach(t => {
    const roomObj = rooms.find(r => r.id === t.roomId);
    const label = roomObj ? (roomObj.name.split(' ')[1] || roomObj.id) : t.roomId;
    roomCounts[label] = (roomCounts[label] || 0) + 1;
  });

  const ctxRoom = document.getElementById('chartRoomFailures')?.getContext('2d');
  if (ctxRoom) {
    if (roomChartInstance) roomChartInstance.destroy();
    roomChartInstance = new Chart(ctxRoom, {
      type: 'bar',
      data: {
        labels: Object.keys(roomCounts),
        datasets: [{
          label: 'จำนวนงานซ่อม (ครั้ง)',
          data: Object.values(roomCounts),
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(244, 63, 94, 0.7)'
          ],
          borderColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b',
            '#a855f7',
            '#f43f5e'
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` แจ้งซ่อมสะสม: ${ctx.raw} ครั้ง`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. ปัญหาที่พบมากที่สุด (Doughnut Chart)
  const categoryCounts = {};
  categories.forEach(c => categoryCounts[c.name] = 0);
  
  tickets.forEach(t => {
    const catObj = categories.find(c => c.id === t.category) || { name: t.categoryName || 'อื่นๆ' };
    categoryCounts[catObj.name] = (categoryCounts[catObj.name] || 0) + 1;
  });

  const ctxCategory = document.getElementById('chartTopCategories')?.getContext('2d');
  if (ctxCategory) {
    if (categoryChartInstance) categoryChartInstance.destroy();
    categoryChartInstance = new Chart(ctxCategory, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          data: Object.values(categoryCounts),
          backgroundColor: [
            '#f43f5e', // เปิดไม่ติด
            '#f59e0b', // เน็ตไม่ได้
            '#eab308', // ช้า
            '#2563eb', // จอฟ้า
            '#a855f7', // เมาส์
            '#6366f1', // คีย์บอร์ด
            '#14b8a6', // เครื่องพิมพ์
            '#64748b'  // อื่นๆ
          ],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: { boxWidth: 12, padding: 12 }
          }
        },
        cutout: '65%'
      }
    });
  }

  // 3. ช่างคนไหนซ่อมมากที่สุด (Horizontal Bar Chart)
  const techCounts = {};
  const techs = users.filter(u => u.role === 'tech');
  techs.forEach(t => techCounts[t.name] = 0);

  tickets.forEach(t => {
    if (t.assignedTech && t.assignedTech !== 'ยังไม่ระบุ') {
      techCounts[t.assignedTech] = (techCounts[t.assignedTech] || 0) + 1;
    }
  });

  const ctxTech = document.getElementById('chartTechPerformance')?.getContext('2d');
  if (ctxTech) {
    if (techChartInstance) techChartInstance.destroy();
    techChartInstance = new Chart(ctxTech, {
      type: 'bar',
      data: {
        labels: Object.keys(techCounts),
        datasets: [{
          label: 'จำนวนเคสที่ดำเนินการ',
          data: Object.values(techCounts),
          backgroundColor: 'rgba(56, 189, 248, 0.75)',
          borderColor: '#38bdf8',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(255, 255, 255, 0.05)' }
          },
          y: {
            grid: { display: false }
          }
        }
      }
    });
  }
}
