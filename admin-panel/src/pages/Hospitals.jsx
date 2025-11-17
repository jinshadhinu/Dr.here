// src/pages/Hospitals.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from "@mui/material";

function Hospitals() {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axiosInstance.get("/admin/hospitals", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHospitals(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHospitals();
  }, []);

  return (
    <Paper sx={{ m: 4, p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Hospitals
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hospitals.map((h) => (
            <TableRow key={h._id}>
              <TableCell>{h.name}</TableCell>
              <TableCell>{h.address}</TableCell>
              <TableCell>{h.phone}</TableCell>
              <TableCell>{h.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default Hospitals;
