import React, { useState } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function exportLogsToCSV(logs) {
  // Headers for a "flattened" CSV without comments
  const headers = [
    "Team Member",
    "Operator Name",
    "Location",
    "Band",
    "Contact Type",
    "Date",
    "QSO"
  ];
  const csvRows = [headers.join(",")];

  logs.forEach(log => {
    const operator = log.operatorInfo || {};
    (log.contacts || []).forEach(contact => {
      const date = contact.date
        ? new Date(contact.date).toLocaleString()
        : "";
      (contact.callsigns || []).forEach(qso => {
        const row = [
          operator.callsign || "",
          operator.name || "",
          operator.location || "",
          contact.band || "",
          contact.contactType || "",
          date,
          qso
        ];
        csvRows.push(row.map(cell => `"${cell}"`).join(","));
      });
    });
  });

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const link = document.createElement("a");
  link.href = csvContent;
  link.download = "cqqrs_log.csv";
  link.click();
}

export default function DownloadReport() {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "logs"));
    // Adapt this mapping to your Firestore document structure
    const logs = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      (data.contacts || []).forEach(contact => {
        logs.push({
          teamMember: data.operatorInfo?.callsign || "",
          cq: `${contact.contactType} ${contact.band}`,
          qsos: contact.callsigns || [],
        });
      });
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