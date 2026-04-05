import * as XLSX from "xlsx";

const guests = [
  // Bride's side (25 including bride)
  { Title: "Ms.", "First Name": "Priya", "Last Name": "Sharma", Side: "BRIDE", Relation: "BRIDE", Email: "priya.sharma@email.com", Phone: "+1-555-0101", Dietary: "", Notes: "Main bride" },
  { Title: "Ms.", "First Name": "Meera", "Last Name": "Kapoor", Side: "BRIDE", Relation: "MAID_OF_HONOR", Email: "meera.kapoor@email.com", Phone: "+1-555-0102", Dietary: "Vegetarian", Notes: "" },
  { Title: "Ms.", "First Name": "Anita", "Last Name": "Patel", Side: "BRIDE", Relation: "BRIDESMAID", Email: "anita.patel@email.com", Phone: "+1-555-0103", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Sana", "Last Name": "Khan", Side: "BRIDE", Relation: "BRIDESMAID", Email: "sana.khan@email.com", Phone: "+1-555-0104", Dietary: "Halal", Notes: "" },
  { Title: "Ms.", "First Name": "Tania", "Last Name": "Roy", Side: "BRIDE", Relation: "BRIDESMAID", Email: "tania.roy@email.com", Phone: "+1-555-0105", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Ramesh", "Last Name": "Sharma", Side: "BRIDE", Relation: "PARENT", Email: "ramesh.sharma@email.com", Phone: "+1-555-0106", Dietary: "Vegetarian", Notes: "Bride's father" },
  { Title: "Mrs.", "First Name": "Sunita", "Last Name": "Sharma", Side: "BRIDE", Relation: "PARENT", Email: "sunita.sharma@email.com", Phone: "+1-555-0107", Dietary: "Vegetarian", Notes: "Bride's mother" },
  { Title: "Mr.", "First Name": "Vikram", "Last Name": "Sharma", Side: "BRIDE", Relation: "CLOSE_RELATIVE", Email: "vikram.sharma@email.com", Phone: "+1-555-0108", Dietary: "", Notes: "Bride's brother" },
  { Title: "Mrs.", "First Name": "Kavita", "Last Name": "Sharma", Side: "BRIDE", Relation: "CLOSE_RELATIVE", Email: "kavita.sharma@email.com", Phone: "+1-555-0109", Dietary: "", Notes: "Bride's aunt" },
  { Title: "Mr.", "First Name": "Suresh", "Last Name": "Verma", Side: "BRIDE", Relation: "RELATIVE", Email: "suresh.verma@email.com", Phone: "+1-555-0110", Dietary: "", Notes: "" },
  { Title: "Mrs.", "First Name": "Pooja", "Last Name": "Verma", Side: "BRIDE", Relation: "RELATIVE", Email: "pooja.verma@email.com", Phone: "+1-555-0111", Dietary: "Vegetarian", Notes: "" },
  { Title: "Mr.", "First Name": "Arjun", "Last Name": "Nair", Side: "BRIDE", Relation: "RELATIVE", Email: "arjun.nair@email.com", Phone: "+1-555-0112", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Deepa", "Last Name": "Nair", Side: "BRIDE", Relation: "RELATIVE", Email: "deepa.nair@email.com", Phone: "+1-555-0113", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Ritu", "Last Name": "Malhotra", Side: "BRIDE", Relation: "CLOSE_FRIEND", Email: "ritu.malhotra@email.com", Phone: "+1-555-0114", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Neha", "Last Name": "Singh", Side: "BRIDE", Relation: "CLOSE_FRIEND", Email: "neha.singh@email.com", Phone: "+1-555-0115", Dietary: "Gluten-free", Notes: "" },
  { Title: "Mr.", "First Name": "Raj", "Last Name": "Bose", Side: "BRIDE", Relation: "FRIEND", Email: "raj.bose@email.com", Phone: "+1-555-0116", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Puja", "Last Name": "Das", Side: "BRIDE", Relation: "FRIEND", Email: "puja.das@email.com", Phone: "+1-555-0117", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Anil", "Last Name": "Gupta", Side: "BRIDE", Relation: "FRIEND", Email: "anil.gupta@email.com", Phone: "+1-555-0118", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Shruti", "Last Name": "Joshi", Side: "BRIDE", Relation: "FRIEND", Email: "shruti.joshi@email.com", Phone: "+1-555-0119", Dietary: "", Notes: "" },
  { Title: "Mrs.", "First Name": "Lata", "Last Name": "Mehta", Side: "BRIDE", Relation: "RELATIVE", Email: "lata.mehta@email.com", Phone: "+1-555-0120", Dietary: "Diabetic", Notes: "Needs wheelchair access" },
  { Title: "Mr.", "First Name": "Gopal", "Last Name": "Mehta", Side: "BRIDE", Relation: "RELATIVE", Email: "gopal.mehta@email.com", Phone: "+1-555-0121", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Isha", "Last Name": "Chopra", Side: "BRIDE", Relation: "FRIEND", Email: "isha.chopra@email.com", Phone: "+1-555-0122", Dietary: "Vegan", Notes: "" },
  { Title: "Mr.", "First Name": "Kiran", "Last Name": "Reddy", Side: "BRIDE", Relation: "FRIEND", Email: "kiran.reddy@email.com", Phone: "+1-555-0123", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Pallavi", "Last Name": "Iyer", Side: "BRIDE", Relation: "CLOSE_FRIEND", Email: "pallavi.iyer@email.com", Phone: "+1-555-0124", Dietary: "", Notes: "" },
  { Title: "Mrs.", "First Name": "Geeta", "Last Name": "Pillai", Side: "BRIDE", Relation: "RELATIVE", Email: "geeta.pillai@email.com", Phone: "+1-555-0125", Dietary: "Vegetarian", Notes: "" },

  // Groom's side (25 including groom)
  { Title: "Mr.", "First Name": "Rahul", "Last Name": "Banerjee", Side: "GROOM", Relation: "GROOM", Email: "rahul.banerjee@email.com", Phone: "+1-555-0201", Dietary: "", Notes: "Main groom" },
  { Title: "Mr.", "First Name": "Siddharth", "Last Name": "Banerjee", Side: "GROOM", Relation: "BEST_MAN", Email: "sid.banerjee@email.com", Phone: "+1-555-0202", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Rohit", "Last Name": "Mishra", Side: "GROOM", Relation: "GROOMSMAN", Email: "rohit.mishra@email.com", Phone: "+1-555-0203", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Nikhil", "Last Name": "Jain", Side: "GROOM", Relation: "GROOMSMAN", Email: "nikhil.jain@email.com", Phone: "+1-555-0204", Dietary: "Jain", Notes: "" },
  { Title: "Mr.", "First Name": "Sameer", "Last Name": "Rao", Side: "GROOM", Relation: "GROOMSMAN", Email: "sameer.rao@email.com", Phone: "+1-555-0205", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Dinesh", "Last Name": "Banerjee", Side: "GROOM", Relation: "PARENT", Email: "dinesh.banerjee@email.com", Phone: "+1-555-0206", Dietary: "", Notes: "Groom's father" },
  { Title: "Mrs.", "First Name": "Mala", "Last Name": "Banerjee", Side: "GROOM", Relation: "PARENT", Email: "mala.banerjee@email.com", Phone: "+1-555-0207", Dietary: "Vegetarian", Notes: "Groom's mother" },
  { Title: "Ms.", "First Name": "Priti", "Last Name": "Banerjee", Side: "GROOM", Relation: "CLOSE_RELATIVE", Email: "priti.banerjee@email.com", Phone: "+1-555-0208", Dietary: "", Notes: "Groom's sister" },
  { Title: "Mr.", "First Name": "Ashok", "Last Name": "Banerjee", Side: "GROOM", Relation: "CLOSE_RELATIVE", Email: "ashok.banerjee@email.com", Phone: "+1-555-0209", Dietary: "", Notes: "Groom's uncle" },
  { Title: "Mrs.", "First Name": "Rekha", "Last Name": "Chakraborty", Side: "GROOM", Relation: "RELATIVE", Email: "rekha.chakraborty@email.com", Phone: "+1-555-0210", Dietary: "Vegetarian", Notes: "" },
  { Title: "Mr.", "First Name": "Bimal", "Last Name": "Chakraborty", Side: "GROOM", Relation: "RELATIVE", Email: "bimal.chakraborty@email.com", Phone: "+1-555-0211", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Tarun", "Last Name": "Sen", Side: "GROOM", Relation: "RELATIVE", Email: "tarun.sen@email.com", Phone: "+1-555-0212", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Mitu", "Last Name": "Sen", Side: "GROOM", Relation: "RELATIVE", Email: "mitu.sen@email.com", Phone: "+1-555-0213", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Partha", "Last Name": "Dutta", Side: "GROOM", Relation: "CLOSE_FRIEND", Email: "partha.dutta@email.com", Phone: "+1-555-0214", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Subhro", "Last Name": "Ghosh", Side: "GROOM", Relation: "CLOSE_FRIEND", Email: "subhro.ghosh@email.com", Phone: "+1-555-0215", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Sudeshna", "Last Name": "Mukherjee", Side: "GROOM", Relation: "FRIEND", Email: "sudeshna.m@email.com", Phone: "+1-555-0216", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Ayan", "Last Name": "Basu", Side: "GROOM", Relation: "FRIEND", Email: "ayan.basu@email.com", Phone: "+1-555-0217", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Dibyendu", "Last Name": "Paul", Side: "GROOM", Relation: "FRIEND", Email: "dibyendu.paul@email.com", Phone: "+1-555-0218", Dietary: "Vegetarian", Notes: "" },
  { Title: "Ms.", "First Name": "Tanushree", "Last Name": "Das", Side: "GROOM", Relation: "FRIEND", Email: "tanushree.das@email.com", Phone: "+1-555-0219", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Kaushik", "Last Name": "Mondal", Side: "GROOM", Relation: "FRIEND", Email: "kaushik.mondal@email.com", Phone: "+1-555-0220", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Sudipto", "Last Name": "Roy", Side: "GROOM", Relation: "RELATIVE", Email: "sudipto.roy@email.com", Phone: "+1-555-0221", Dietary: "", Notes: "" },
  { Title: "Mrs.", "First Name": "Sutapa", "Last Name": "Roy", Side: "GROOM", Relation: "RELATIVE", Email: "sutapa.roy@email.com", Phone: "+1-555-0222", Dietary: "Vegetarian", Notes: "" },
  { Title: "Mr.", "First Name": "Bikash", "Last Name": "Saha", Side: "GROOM", Relation: "CLOSE_FRIEND", Email: "bikash.saha@email.com", Phone: "+1-555-0223", Dietary: "", Notes: "" },
  { Title: "Ms.", "First Name": "Debjani", "Last Name": "Kundu", Side: "GROOM", Relation: "CLOSE_FRIEND", Email: "debjani.kundu@email.com", Phone: "+1-555-0224", Dietary: "", Notes: "" },
  { Title: "Mr.", "First Name": "Prosenjit", "Last Name": "Mitra", Side: "GROOM", Relation: "RELATIVE", Email: "prosenjit.mitra@email.com", Phone: "+1-555-0225", Dietary: "", Notes: "" },
];

const ws = XLSX.utils.json_to_sheet(guests);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Guest List");

ws["!cols"] = [
  { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 8 }, { wch: 16 },
  { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 24 },
];

XLSX.writeFile(wb, "C:/Users/Radius-PC-1/Downloads/wedding-guest-list.xlsx");
console.log("Done! Saved to C:/Users/Radius-PC-1/Downloads/wedding-guest-list.xlsx");
