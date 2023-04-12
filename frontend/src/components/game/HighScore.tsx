import React, { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel } from "@mui/material";
import { User } from "../BaseInterface";

export default function HighScore() {
  const [data, setData] = useState([]);
  const [orderDirection, setOrderDirection] = useState<"asc" | "desc" | undefined>("asc");

  useEffect(() => {
    axios
      .get(`http://${window.location.hostname}:5000/users`, { withCredentials: true })
      .then((res) => {
        setData(res.data);
        console.log("Result:", data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const sortArray = (arr : never[], orderBy: string | undefined) => {
    switch (orderBy) {
      case "asc":
      default:
        return arr.sort((a : User, b : User) =>
          a.score > b.score ? 1 : b.score > a.score ? -1 : 0
        );
      case "desc":
        return arr.sort((a : User, b : User) =>
          a.score < b.score ? 1 : b.score < a.score ? -1 : 0
        );
    }
  };

  const handleSortRequest = () => {
    setData(sortArray(data, orderDirection));
    setOrderDirection(orderDirection === "asc" ? "desc" : "asc");
  };

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell align="right">Wins</TableCell>
            <TableCell align="right">Losses</TableCell>
            <TableCell align="right">Draws</TableCell>
            <TableCell align="right" onClick={handleSortRequest}>
              <TableSortLabel active={true} direction={orderDirection}>
                Score
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((user : User) => (
            <TableRow key={user.id}>
              <TableCell>
                <Avatar alt={user.displayName} src={`http://${window.location.hostname}:5000/users/image/${user.photo}`} />
                {user.displayName}
              </TableCell>
              <TableCell align="right">{user.wins}</TableCell>
              <TableCell align="right">{user.losses}</TableCell>
              <TableCell align="right">{user.draws}</TableCell>
              <TableCell align="right">{user.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}