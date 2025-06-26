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
    const qsos = log.qsos || [];
    for (let i = 0; i < qsos.length; i += 8) {
      const chunk = qsos.slice(i, i + 8);
      const row = [
        log.teamMember,
        log.cq,
        ...chunk,
        ...Array(8 - chunk.length).fill("")
      ];
      csvRows.push(row.map(cell => `"${cell}"`).join(","));
    }
    if (qsos.length === 0) {
      csvRows.push([log.teamMember, log.cq, ...Array(8).fill("")].map(cell => `"${cell}"`).join(","));
    }
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