import { Box, Link } from "@mui/material";
import { FaGithub } from "react-icons/fa";

const TopBar = () => {
  return (
    <Box display="flex" justifyContent="center">
      <Link
        target="_blank"
        sx={{ color: "yellow" }}
        href="https://github.com/shubhamkakirde99/connect-4-ui"
      >
        <FaGithub /> Click me to view the source code <FaGithub />
      </Link>
    </Box>
  );
};

export default TopBar;
