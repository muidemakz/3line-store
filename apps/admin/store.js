const Store = (() => {
  // --- Point config ---
  function getPointConfig() {
    return JSON.parse(localStorage.getItem('pointConfig') || '{}');
  }

  function nairaToPoints(naira) {
    const nairaPerPt = parseFloat(getPointConfig().nairaPerPt) || 200;
    return Math.floor(naira / nairaPerPt);
  }

  function getGradeConfig() {
    return JSON.parse(localStorage.getItem('gradeConfig') || '[]');
  }

  function getPointsForGrade(gradeLevel) {
    const grade = getGradeConfig().find(g => g.level === gradeLevel);
    return grade ? parseInt(grade.points, 10) || 0 : 0;
  }

  // --- Persistence helpers ---
  function load(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Users ---
  function getUsers() { return load('users'); }

  function addUser(data) {
    const users = getUsers();
    const user = {
      id: Date.now().toString(),
      name: data.userName,
      email: data.userEmail,
      type: data.userType,
      gradeLevel: data.gradeLevel,
      points: 0,
      sessionIds: [],
      dateAdded: new Date().toLocaleDateString('en-GB')
    };
    users.push(user);
    save('users', users);
    return user;
  }

  // --- Sessions ---
  function getSessions() { return load('sessions'); }

  function parseDate(ddmmyyyy) {
    const [d, m, y] = ddmmyyyy.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  function deriveStatus(startDate, endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (today < start) return 'Upcoming';
    if (today > end) return 'Expired';
    return 'Active';
  }

  function createSession(data) {
    const { sessionName, startDate, endDate } = data;
    if (parseDate(endDate) <= parseDate(startDate)) {
      throw new Error('End date must be after start date');
    }

    const session = {
      id: Date.now().toString(),
      name: sessionName,
      startDate,
      endDate,
      status: deriveStatus(startDate, endDate),
      dateCreated: new Date().toLocaleDateString('en-GB'),
      userIds: [],
      orderIds: []
    };

    // Allocate points to all users based on their grade level
    const users = getUsers();
    users.forEach(user => {
      const pts = getPointsForGrade(user.gradeLevel);
      if (pts > 0) {
        user.points += pts;
        user.sessionIds.push(session.id);
        session.userIds.push(user.id);
      }
    });

    const sessions = getSessions();
    sessions.push(session);
    save('sessions', sessions);
    save('users', users);
    return session;
  }

  // --- Items ---
  function getItems() { return load('items'); }

  function addItem(data) {
    const items = getItems();
    const naira = parseFloat(data.amountNaira) || 0;
    const item = {
      id: Date.now().toString(),
      name: data.itemName,
      brand: data.brandName,
      unit: data.unit,
      description: data.itemDesc || '',
      naira,
      points: nairaToPoints(naira),
      dateAdded: new Date().toLocaleDateString('en-GB')
    };
    items.push(item);
    save('items', items);
    return item;
  }

  // --- Orders ---
  function getOrders() { return load('orders'); }

  function createOrder(userId, sessionId, orderItems) {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');

    const totalPoints = orderItems.reduce((sum, i) => sum + i.points * i.qty, 0);
    if (user.points < totalPoints) throw new Error('Insufficient points');

    user.points -= totalPoints;

    const orders = getOrders();
    const order = {
      id: `#${String(orders.length + 1).padStart(4, '0')}`,
      userId,
      sessionId,
      userName: user.name,
      items: orderItems,
      totalPoints,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-GB')
    };
    orders.push(order);
    save('orders', orders);
    save('users', users);

    // Link order to session
    const sessions = getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.orderIds.push(order.id);
      save('sessions', sessions);
    }

    return order;
  }

  // Shopping list: group items across all non-cancelled orders for a session, summing quantities
  function getShoppingList(sessionId) {
    const orders = sessionId
      ? getOrders().filter(o => o.sessionId === sessionId && o.status !== 'Cancelled')
      : getOrders().filter(o => o.status !== 'Cancelled');

    const map = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (map[item.itemId]) {
          map[item.itemId].qty += item.qty;
        } else {
          map[item.itemId] = { ...item };
        }
      });
    });
    return Object.values(map);
  }

  return {
    nairaToPoints,
    getPointConfig,
    getGradeConfig,
    getPointsForGrade,
    getUsers,
    addUser,
    getSessions,
    createSession,
    deriveStatus,
    getItems,
    addItem,
    getOrders,
    createOrder,
    getShoppingList
  };
})();
