import {
  Table,
  TableBody,
  TableContainer,
  Paper,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";

const TableExchange = (props) => {
  return (
    <>
      <h3>{props.title}</h3>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">CRC (₡)</TableCell>
              <TableCell align="right">Currency</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {props.data.map((item) => (
              <tr key={item.date}>
                <TableCell component="th" scope="row">
                  {item.date}
                </TableCell>
                <TableCell align="right">{item.value}</TableCell>
                <TableCell align="right">{item.currency}</TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default TableExchange;
