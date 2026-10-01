// Static mock data for the frontend-only dashboard.

export type PeopleStatus = "Receivable" | "Payable";

export const kpis = {
  allOrders: "12+",
  pendingOrders: "128",
  todayOrders: "12",
};

export const latestOrders = [
  { creator: "Admin User", sale: 22100, profit: 4400 },
  { creator: "Sharjeel", sale: 8900, profit: 1250 },
  { creator: "Azhar", sale: 14500, profit: -2800 },
];

export const shopNeedsText = `Low stock alert — please restock before the weekend rush:

• Super Biscuit cartons: only 3 cartons left (usual weekly sale is 10+).
• Cooking oil 5L tins: 4 remaining; Dalda and Habib both running low.
• Sugar (50kg bag): half a bag left, order 2 bags from the wholesaler.
• Tapal Danedar tea 950g: 6 packs left, supplier visit due Thursday.
• Surf Excel 1kg: out of stock since Monday — customers have been asking.
• Mobile load cards: Zong and Ufone scratch cards below 20 units each.
• Eggs: 2 trays left; confirm daily supply timing with the farm.
• Plastic shopping bags (medium): 1 bundle left.

Note: Shan masala boxes arrived short by 12 pieces on the last delivery — adjust the bill with the distributor before paying.`;

export const peopleSummary = [
  { name: "Imran Butt", status: "Receivable" as PeopleStatus, amount: 12450 },
  { name: "Haji Sadiq Traders", status: "Payable" as PeopleStatus, amount: 32000 },
  { name: "Bilal Ahmed", status: "Receivable" as PeopleStatus, amount: 5800 },
  { name: "Nestle Distributor", status: "Payable" as PeopleStatus, amount: 18500 },
];

export const cashAccounts = [
  "Cash 10/20",
  "Cash 50/100",
  "Cash 500/1000/5000",
  "Jazzcash",
  "Easypaisa",
  "Abbas",
  "Waqas",
  "Azhar",
  "Tassawar",
];

export const payableAccounts = ["Abbas", "Waqas", "Azhar", "Tassawar", "Wholesaler"];

export const loadOperators = [
  { operator: "Hafiz", phone: "0300-1234567" },
  { operator: "Telenor", phone: "0345-2345678" },
  { operator: "Jazz", phone: "0301-3456789" },
  { operator: "Ufone", phone: "0333-4567890" },
  { operator: "Zong 1", phone: "0312-5678901" },
  { operator: "Zong 2", phone: "0315-6789012" },
  { operator: "Jazzcash", phone: "0302-7890123" },
];

export const previousCash = 124657;

export type HistoryStatus = "Closed" | "Open";

export const shopHistory = [
  {
    id: "00000",
    amount: 85000,
    date: "05/15/2026",
    user: "Rana",
    status: "Closed" as HistoryStatus,
    note: "Day closed normally. Wholesaler paid in cash, Jazzcash balance transferred to main account.",
  },
  {
    id: "00001",
    amount: 72350,
    date: "05/14/2026",
    user: "Azhar",
    status: "Closed" as HistoryStatus,
    note: "Heavy sale due to Eid shopping. Extra 5,000 kept aside for next morning's milk supply.",
  },
  {
    id: "00002",
    amount: 64900,
    date: "05/13/2026",
    user: "Sharjeel",
    status: "Open" as HistoryStatus,
    note: "Easypaisa mismatch of RS 350 — to be verified against the agent statement.",
  },
  {
    id: "00003",
    amount: 91200,
    date: "05/12/2026",
    user: "Rana",
    status: "Closed" as HistoryStatus,
    note: "Load sale was high today. Zong 2 SIM recharged twice with 10,000 each.",
  },
  {
    id: "00004",
    amount: 58750,
    date: "05/11/2026",
    user: "Tassawar",
    status: "Closed" as HistoryStatus,
    note: "Quiet day. Paid electricity bill (RS 7,200) from the drawer, receipt kept in file.",
  },
  {
    id: "00005",
    amount: 79400,
    date: "05/10/2026",
    user: "Azhar",
    status: "Open" as HistoryStatus,
    note: "Waqas took 3,000 advance; to be deducted from end of month payable.",
  },
];

export type OrderStatus = "Pending" | "Delivered" | "Cancelled";

export const orders = [
  { id: 1, title: "Super Biscuit Cartons", status: "Pending" as OrderStatus, price: 12500, createdBy: "Azhar" },
  { id: 2, title: "Dalda Cooking Oil 5L (x6)", status: "Pending" as OrderStatus, price: 21600, createdBy: "Rana" },
  { id: 3, title: "Tapal Danedar 950g (x12)", status: "Delivered" as OrderStatus, price: 18240, createdBy: "Sharjeel" },
  { id: 4, title: "Sugar 50kg Bags (x2)", status: "Pending" as OrderStatus, price: 14800, createdBy: "Azhar" },
  { id: 5, title: "Surf Excel 1kg (x10)", status: "Cancelled" as OrderStatus, price: 7400, createdBy: "Admin User" },
  { id: 6, title: "Shan Masala Assorted Box", status: "Delivered" as OrderStatus, price: 9350, createdBy: "Tassawar" },
];

export type PersonStatus = "Pending" | "Cleared";

export const people = [
  {
    id: 1,
    name: "Sarah Jenkins",
    status: "Pending" as PersonStatus,
    phone: "0300-1122334",
    address: "House 12, Street 4, Model Town",
    amount: 12450,
    info: "Monthly grocery account. Pays on the 5th of every month.",
    createdBy: "Azhar",
  },
  {
    id: 2,
    name: "Haji Sadiq Traders",
    status: "Pending" as PersonStatus,
    phone: "0321-9988776",
    address: "Shop 7, Akbari Mandi",
    amount: -32000,
    info: "Wholesale supplier for sugar, rice and pulses. 15-day credit.",
    createdBy: "Rana",
  },
  {
    id: 3,
    name: "Bilal Ahmed",
    status: "Cleared" as PersonStatus,
    phone: "0333-4455667",
    address: "Flat 3B, Gulberg III",
    amount: 5800,
    info: "Takes daily milk and bread on credit; settles weekly.",
    createdBy: "Sharjeel",
  },
  {
    id: 4,
    name: "Nestle Distributor",
    status: "Pending" as PersonStatus,
    phone: "0345-7766554",
    address: "Industrial Area, Kot Lakhpat",
    amount: -18500,
    info: "Dairy & juice products. Invoice #4471 pending.",
    createdBy: "Azhar",
  },
  {
    id: 5,
    name: "Ayesha Khan",
    status: "Cleared" as PersonStatus,
    phone: "0312-3344556",
    address: "House 88, Block C, Johar Town",
    amount: 2300,
    info: "Occasional credit customer.",
    createdBy: "Tassawar",
  },
  {
    id: 6,
    name: "Usman Load Agent",
    status: "Pending" as PersonStatus,
    phone: "0301-6655443",
    address: "Main Bazaar",
    amount: -9750,
    info: "Supplies Jazz and Zong load balance.",
    createdBy: "Admin User",
  },
];

export const peopleKpis = {
  totalReceivable: "RS 145,000",
  totalPayable: "RS 68,000",
  activePeople: "48",
};

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export const products = [
  { id: 1, name: "Super Biscuit (Half Roll)", customerPrice: 50, piece: 42, box: 1000, date: "05/15/2026", status: "Low Stock" as ProductStatus },
  { id: 2, name: "Dalda Cooking Oil 5L", customerPrice: 3750, piece: 3600, box: 21600, date: "05/14/2026", status: "In Stock" as ProductStatus },
  { id: 3, name: "Tapal Danedar 950g", customerPrice: 1650, piece: 1520, box: 18240, date: "05/13/2026", status: "In Stock" as ProductStatus },
  { id: 4, name: "Surf Excel 1kg", customerPrice: 780, piece: 740, box: 7400, date: "05/12/2026", status: "Out of Stock" as ProductStatus },
  { id: 5, name: "Shan Biryani Masala", customerPrice: 150, piece: 132, box: 1584, date: "05/11/2026", status: "In Stock" as ProductStatus },
  { id: 6, name: "Nestle Milkpak 1L", customerPrice: 290, piece: 272, box: 3264, date: "05/10/2026", status: "Low Stock" as ProductStatus },
  { id: 7, name: "Lipton Yellow Label 190g", customerPrice: 620, piece: 575, box: 6900, date: "05/09/2026", status: "In Stock" as ProductStatus },
];
