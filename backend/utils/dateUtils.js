const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD HH:mm':
      return `${year}-${month}-${day} ${hours}:${minutes}`;
    default:
      return d.toISOString();
  }
};

const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.toDateString() === checkDate.toDateString();
};

const isYesterday = (date) => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const checkDate = new Date(date);
  
  return yesterday.toDateString() === checkDate.toDateString();
};

const daysBetween = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const getWeekStart = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
  result.setDate(diff);
  return startOfDay(result);
};

const getWeekEnd = (date) => {
  const weekStart = getWeekStart(date);
  return endOfDay(addDays(weekStart, 6));
};

const isOverdue = (dueDate) => {
  return new Date(dueDate) < new Date();
};

const timeRemaining = (dueDate) => {
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = due - now;
  
  if (diffMs < 0) {
    return { overdue: true, message: 'Overdue' };
  }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return { overdue: false, message: `${days} day${days > 1 ? 's' : ''} remaining` };
  } else if (hours > 0) {
    return { overdue: false, message: `${hours} hour${hours > 1 ? 's' : ''} remaining` };
  } else {
    return { overdue: false, message: `${minutes} minute${minutes > 1 ? 's' : ''} remaining` };
  }
};

export {
  formatDate,
  isToday,
  isYesterday,
  daysBetween,
  addDays,
  startOfDay,
  endOfDay,
  getWeekStart,
  getWeekEnd,
  isOverdue,
  timeRemaining
};