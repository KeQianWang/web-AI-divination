const sortHistoryMessages = (messages) => {
  const roleOrder = { user: 0, assistant: 1 };
  return messages
    .map((message, index) => ({ ...message, __order: index }))
    .sort((a, b) => {
      const timeA = a.createdAt ? Date.parse(a.createdAt) : NaN;
      const timeB = b.createdAt ? Date.parse(b.createdAt) : NaN;
      if (!Number.isNaN(timeA) && !Number.isNaN(timeB) && timeA !== timeB) {
        return timeA - timeB;
      }
      if (!Number.isNaN(timeA) && Number.isNaN(timeB)) return -1;
      if (Number.isNaN(timeA) && !Number.isNaN(timeB)) return 1;
      if (a.createdAt && b.createdAt && a.createdAt === b.createdAt) {
        return (roleOrder[a.role] ?? 2) - (roleOrder[b.role] ?? 2);
      }
      return a.__order - b.__order;
    })
    .map(({ __order, ...message }) => message);
};

export const buildHistory = (items) => {
  const messages = items.flatMap((item, index) => {
    if (!item) return [];
    if (item.role && item.content) {
      return [
        {
          id: item.id || `${item.role}-${index}`,
          role: item.role,
          content: item.content,
          mood: item.mood,
          createdAt: item.created_at || item.createdAt
        }
      ];
    }
    const entries = [];
    if (item.user_message || item.query) {
      entries.push({
        id: `u-${item.id || index}`,
        role: 'user',
        content: item.user_message || item.query,
        mood: item.mood,
        createdAt: item.created_at
      });
    }
    if (item.assistant_message || item.response) {
      entries.push({
        id: `a-${item.id || index}`,
        role: 'assistant',
        content: item.assistant_message || item.response,
        mood: item.mood,
        createdAt: item.created_at
      });
    }
    return entries;
  });
  return sortHistoryMessages(messages);
};

export const updateLastAssistantMood = (messages, mood) => {
  if (!mood) return messages;
  const reversedIndex = [...messages].reverse().findIndex((item) => item.role === 'assistant');
  if (reversedIndex === -1) return messages;
  const targetIndex = messages.length - 1 - reversedIndex;
  const target = messages[targetIndex];
  if (!target || target.mood === mood) return messages;
  const next = [...messages];
  next[targetIndex] = { ...target, mood };
  return next;
};
