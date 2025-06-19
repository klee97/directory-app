import IconButton from "@mui/material/IconButton"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import { useEffect, useState } from "react"

const Scroll = (
  { showBelow }: { showBelow: number }
) => {
  const [show, setShow] = useState(showBelow ? false : true)

  const handleScroll = () => {
    if (window.pageYOffset > showBelow) {
      if (!show) setShow(true)
    } else {
      if (show) setShow(false)
    }
  }

  useEffect((() => {
    if (showBelow) {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }))

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <>
      {show &&
        <IconButton onClick={handleClick} sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 100,
          backgroundColor: "primary.main",
          color: "background.default",
          "&:hover": {
            backgroundColor: "primary.dark"
          }
        }}>
          <ExpandLessIcon />
        </IconButton>
      }
    </>
  )
}

export default Scroll;