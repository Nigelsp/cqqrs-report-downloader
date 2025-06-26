import React, { useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function exportLogsToCSV(logs) {
  const headers = [
    "CQQRS Team Member", "CQ",
    ...Array.from({ length: 8 }, (_, i) => `QSO ${i + 1}`)
  ];
  const csvRows = [headers.join(",")];

  logs.forEach(log => {
    const operator = log.operatorInfo || {};
    (log.contacts || []).forEach(contact => {
      const qsos = contact.callsigns || [];
      const row = [
        operator.callsign || "",
        `${contact.contactType || ""}${contact.band ? " " + contact.band : ""}`,
        ...qsos.slice(0, 8),
        ...Array(8 - qsos.length).fill("")
      ];
      csvRows.push(row.map(cell => `"${cell}"`).join(","));
    });
  });

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
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