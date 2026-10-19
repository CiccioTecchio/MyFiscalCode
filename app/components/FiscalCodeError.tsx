import { Box, Typography } from "@mui/material";

type FiscalCodeErrorProps = {
  message: string;
};

const FiscalCodeError = ({ message }: FiscalCodeErrorProps) => {
  return (
    <Box
      component="section"
      role="alert"
      className="mt-2 border-t border-red-900/20 pt-3"
    >
      <Typography
        component="p"
        variant="body2"
        className="text-center font-medium text-red-800"
      >
        {message}
      </Typography>
    </Box>
  );
};

export default FiscalCodeError;
