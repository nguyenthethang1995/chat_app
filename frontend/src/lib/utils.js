export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function pushItemToTop(array, item) {
  if (array.length === 1) return array;

  const index = array.findIndex(i => i.id === item?.id);
  if (index > -1) {
    array.splice(index, 1);
  }
  array.unshift(item);

  return array;
}
