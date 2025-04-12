export const formatInr = (price: number) => {
  if (isNaN(price) || price <= 0) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(price / 100);
};
