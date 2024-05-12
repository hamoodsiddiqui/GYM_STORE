function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    month: "short",
    day: "2-digit",
    year: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

module.exports = { formatDate };
