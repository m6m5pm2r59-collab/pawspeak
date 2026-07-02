/* ============================================
   集团周报系统 – 核心逻辑
   数据存储：localStorage（演示用，生产环境需后端API）
   ============================================ */

const STORAGE_KEYS = {
  DEPTS: 'wr_depts',
  REPORTS: 'wr_reports',
  CURRENT_USER: 'wr_current_user'
};

// ============================================
// 初始化演示数据
// ============================================
function initDemoData() {
  if (!localStorage.getItem(STORAGE_KEYS.DEPTS)) {
    const depts = [
      { id: 'DEPT-001', name: '人力资源部', role: 'member', password: '123456' },
      { id: 'DEPT-002', name: '技术研发部', role: 'manager', password: '123456' },
      { id: 'DEPT-003', name: '市场营销部', role: 'member', password: '123456' },
      { id: 'DEPT-004', name: '财务管理部', role: 'member', password: '123456' },
      { id: 'ADMIN', name: '系统管理员', role: 'admin', password: 'admin888' }
    ];
    localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(depts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.REPORTS)) {
    const now = new Date();
    const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 7);
    const twoWeeksAgo = new Date(now); twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const reports = [
      {
        id: genId(),
        deptId: 'DEPT-001',
        deptName: '人力资源部',
        summary: '本周完成春季招聘初试 45 人，复试通过 12 人。员工培训计划已启动，参与人数 68 人。',
        metrics: '招聘转化率 26.7%，培训参与率 85%，员工满意度 4.6/5',
        issues: '部分岗位简历质量不高，需优化招聘渠道',
        nextPlan: '下周重点跟进 Offer 发放，启动管理培训生项目',
        createdAt: lastWeek.toISOString()
      },
      {
        id: genId(),
        deptId: 'DEPT-002',
        deptName: '技术研发部',
        summary: '完成用户中心 2.0 重构，性能提升 40%。修复线上 Bug 8 个，代码覆盖率提升至 78%。',
        metrics: '需求完成 12/15，Bug 修复率 100%，上线 2 次',
        issues: '第三方 API 不稳定影响部分功能',
        nextPlan: '下周重点：消息推送模块重构，性能监控告警接入',
        createdAt: lastWeek.toISOString()
      },
      {
        id: genId(),
        deptId: 'DEPT-003',
        deptName: '市场营销部',
        summary: '618 大促活动策划完成，合作 KOL 15 位。社媒曝光量达 120 万次。',
        metrics: '新增线索 3200 条，转化率 4.1%，ROI 1:3.2',
        issues: '广告素材审核周期较长',
        nextPlan: '下周：落地页 A/B 测试，优化投放策略',
        createdAt: twoWeeksAgo.toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
  }
}

function genId() { return 'rpt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function getDepts() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPTS) || '[]'); }
function getReports() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]'); }
function saveReports(reports) { localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports)); }

// ============================================
// 登录逻辑
// ============================================
function handleLogin(e) {
  e.preventDefault();
  const deptId = document.getElementById('dept-id').value.trim();
  const pwd = document.getElementById('dept-pwd').value;
  const errorEl = document.getElementById('login-error');
  const depts = getDepts();
  const dept = depts.find(d => d.id === deptId && d.password === pwd);

  if (!dept) {
    errorEl.textContent = '账号或密码错误，请重试';
    errorEl.classList.remove('hidden');
    return;
  }

  const user = { id: dept.id, name: dept.name, role: dept.role };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  errorEl.classList.add('hidden');
  showDashboard(user);
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  document.getElementById('login-section').classList.add('active');
  document.getElementById('dashboard-section').classList.remove('active');
  document.getElementById('login-form').reset();
}

function checkAuth() {
  const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function showDashboard(user) {
  document.getElementById('login-section').classList.remove('active');
  document.getElementById('dashboard-section').classList.add('active');
  document.getElementById('current-dept').textContent = user.name;
  document.getElementById('current-role').textContent = 
    user.role === 'admin' ? '管理员' : user.role === 'manager' ? '部门经理' : '成员';

  // 显示管理选项卡
  if (user.role === 'manager') {
    document.getElementById('tab-overview').style.display = '';
  }
  if (user.role === 'admin') {
    document.getElementById('tab-overview').style.display = '';
    document.getElementById('tab-admin').style.display = '';
  }

  loadHistory(user);
}

// ============================================
// Tab 切换
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initDemoData();

  const user = checkAuth();
  if (user) showDashboard(user);

  // Tab 切换
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const tabId = 'tab-' + tab.dataset.tab;
      document.getElementById(tabId).classList.add('active');

      const user = checkAuth();
      if (tab.dataset.tab === 'overview' && user) loadOverview(user);
      if (tab.dataset.tab === 'admin' && user) loadAdmin(user);
      if (tab.dataset.tab === 'history' && user) loadHistory(user);
    });
  });
});

// ============================================
// 提交周报
// ============================================
function handleSubmitReport(e) {
  e.preventDefault();
  const user = checkAuth();
  if (!user) return;

  const report = {
    id: genId(),
    deptId: user.id,
    deptName: user.name,
    summary: document.getElementById('summary').value.trim(),
    metrics: document.getElementById('metrics').value.trim(),
    issues: document.getElementById('issues').value.trim(),
    nextPlan: document.getElementById('next-plan').value.trim(),
    createdAt: new Date().toISOString()
  };

  const reports = getReports();
  // 检查本周是否已提交（简单去重：同部门同周只允许一条）
  const thisWeekStart = getWeekStart(new Date());
  const already = reports.find(r => 
    r.deptId === user.id && 
    new Date(r.createdAt) >= thisWeekStart
  );
  if (already) {
    if (!confirm('本周已有周报，是否覆盖？')) return;
    reports.splice(reports.indexOf(already), 1);
  }

  reports.push(report);
  saveReports(reports);

  document.getElementById('report-form').reset();
  document.getElementById('submit-btn').style.display = 'none';
  document.getElementById('submit-success').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('submit-success').classList.add('hidden');
    document.getElementById('submit-btn').style.display = '';
  }, 2500);
}

function getWeekStart(d) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

// ============================================
// 历史周报
// ============================================
function loadHistory(user) {
  const reports = getReports().filter(r => r.deptId === user.id);
  const listEl = document.getElementById('history-list');

  if (reports.length === 0) {
    listEl.innerHTML = '<div class="empty-state">暂无历史周报，点击"提交周报"创建第一条</div>';
    return;
  }

  reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  listEl.innerHTML = reports.map(r => `
    <div class="history-item">
      <div class="history-date">${formatDate(r.createdAt)}</div>
      <div class="history-summary"><strong>总结：</strong>${escHtml(r.summary)}</div>
      <div class="history-summary" style="margin-top:6px"><strong>数据：</strong>${escHtml(r.metrics)}</div>
    </div>
  `).join('');
}

// ============================================
// 数据看板（经理+管理员）
// ============================================
function loadOverview(user) {
  const reports = getReports();
  const depts = getDepts().filter(d => d.role !== 'admin');
  const now = new Date();
  const weekStart = getWeekStart(now);
  const thisWeekReports = reports.filter(r => new Date(r.createdAt) >= weekStart);
  const lastWeekStart = new Date(weekStart); lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekReports = reports.filter(r => {
    const d = new Date(r.createdAt);
    return d >= lastWeekStart && d < weekStart;
  });

  // 统计
  document.getElementById('stat-total').textContent = thisWeekReports.length;
  const rate = depts.length > 0 ? Math.round(thisWeekReports.length / depts.length * 100) : 0;
  document.getElementById('stat-rate').textContent = rate + '%';
  const activeDepts = new Set(thisWeekReports.map(r => r.deptId)).size;
  document.getElementById('stat-depts').textContent = activeDepts;

  // 迷你图表（近4周）
  const chartEl = document.getElementById('mini-chart');
  const weeks = [];
  for (let i = 3; i >= 0; i--) {
    const ws = new Date(weekStart); ws.setDate(ws.getDate() - i * 7);
    const we = new Date(ws); we.setDate(we.getDate() + 6);
    const count = reports.filter(r => {
      const d = new Date(r.createdAt);
      return d >= ws && d <= we;
    }).length;
    weeks.push({ label: `W${4-i}`, count });
  }
  const maxCount = Math.max(...weeks.map(w => w.count), 1);
  chartEl.innerHTML = weeks.map(w => `
    <div class="chart-bar" style="height:${(w.count / maxCount) * 80}px">
      <span class="chart-bar-label">${w.label}(${w.count})</span>
    </div>
  `).join('');

  // 各部门最新周报表格
  const tbody = document.querySelector('#overview-table tbody');
  const latestMap = {};
  reports.forEach(r => {
    if (!latestMap[r.deptId] || new Date(r.createdAt) > new Date(latestMap[r.deptId].createdAt)) {
      latestMap[r.deptId] = r;
    }
  });
  tbody.innerHTML = depts.map(d => {
    const r = latestMap[d.id];
    const status = r && new Date(r.createdAt) >= weekStart ? 'submitted' : 'pending';
    const statusText = status === 'submitted' ? '已提交' : '未提交';
    const time = r ? formatDate(r.createdAt) : '--';
    return `<tr>
      <td>${escHtml(d.name)}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${time}</td>
      <td><span class="status-badge ${status}">${statusText}</span></td>
    </tr>`;
  }).join('');
}

// ============================================
// 管理后台（管理员）
// ============================================
function loadAdmin(user) {
  if (user.role !== 'admin') return;

  // 部门列表
  const depts = getDepts();
  const tbody = document.querySelector('#admin-dept-table tbody');
  tbody.innerHTML = depts.map(d => `
    <tr>
      <td style="font-size:12px;color:var(--text-secondary)">${escHtml(d.id)}</td>
      <td>${escHtml(d.name)}</td>
      <td><span class="status-badge submitted">${d.role}</span></td>
      <td><button class="btn-sm" style="background:var(--danger)" onclick="deleteDept('${escHtml(d.id)}')">删除</button></td>
    </tr>
  `).join('');

  // 所有周报
  const reports = getReports();
  reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const rTbody = document.querySelector('#admin-report-table tbody');
  rTbody.innerHTML = reports.map(r => `
    <tr>
      <td>${escHtml(r.deptName)}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${formatDate(r.createdAt)}</td>
      <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${escHtml(r.summary)}">${escHtml(r.summary.slice(0, 30))}...</td>
      <td><button class="btn-sm" style="background:var(--danger)" onclick="deleteReport('${r.id}')">删除</button></td>
    </tr>
  `).join('');
}

function handleAddDept(e) {
  e.preventDefault();
  const id = document.getElementById('new-dept-id').value.trim();
  const name = document.getElementById('new-dept-name').value.trim();
  const role = document.getElementById('new-dept-role').value;
  if (!id || !name) return;

  const depts = getDepts();
  if (depts.find(d => d.id === id)) {
    alert('部门ID已存在');
    return;
  }
  depts.push({ id, name, role, password: '123456' });
  localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(depts));
  document.getElementById('add-dept-form').reset();
  loadAdmin(checkAuth());
}

function deleteDept(id) {
  if (!confirm('确认删除该部门？')) return;
  const depts = getDepts().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEYS.DEPTS, JSON.stringify(depts));
  loadAdmin(checkAuth());
}

function deleteReport(id) {
  if (!confirm('确认删除该周报？')) return;
  const reports = getReports().filter(r => r.id !== id);
  saveReports(reports);
  loadAdmin(checkAuth());
}

// ============================================
// 工具函数
// ============================================
function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
