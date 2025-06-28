import React, { useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function escapeCSV(value) {
  if (value === undefined || value === null) return "";
  const str = String(value);
  if (str.includes('"') || str.includes(",") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportLogsToCSV(logs) {
  const headers = [
    "CQQRS Team Member", "CQ",
    "QSO 1", "QSO 2", "QSO 3", "QSO 4", "QSO 5", "QSO 6", "QSO 7", "QSO 8"
  ];
  const rows = [];

  logs.forEach(log => {
    const operator = log.operatorInfo || {};
    const contacts = Array.isArray(log.contacts) ? log.contacts : [];
    contacts.forEach(contact => {
      const qsos = Array.isArray(contact.callsigns) ? contact.callsigns : [];
      const cq = [contact.contactType, contact.band].filter(Boolean).join(" ");
      rows.push([
        operator.callsign || "",
        cq,
        ...qsos.slice(0, 8),
        ...Array(8 - qsos.length).fill("")
      ]);
    });
  });

  // Sort rows alphabetically by Team Member (callsign)
  rows.sort((a, b) => a[0].localeCompare(b[0]));

  const csvRows = [headers.join(",")].concat(
    rows.map(row => row.map(escapeCSV).join(","))
  );

  console.log("CSV ROWS:", csvRows);
  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\r\n");
  const link = document.createElement("a");
  link.href = csvContent;
  link.download = "cqqrs_log.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function DownloadReport() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "logs"));
    const logs = [];
    querySnapshot.forEach(doc => {
      logs.push(doc.data());
    });
    exportLogsToCSV(logs);
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h2>Download CQQRS Log Report</h2>
      <button onClick={handleDownload} disabled={loading}>
        {loading ? "Preparing..." : "Download CSV"}
      </button>
    </div>
  );
}