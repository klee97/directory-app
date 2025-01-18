import Image from "next/image";
import { CssBaseline } from '@mui/material';
import Directory from '@/features/directory/components/Directory';

export default function Home() {

  return (
    <>
      <title>Hair and Makeup Directory for Asian Brides</title>
      <div className="flex items-center bg-white overflow-y">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8 lg:py-16">
          {/* <AppTheme {...props}> */}
            <CssBaseline enableColorScheme />
            <Directory />
            <p> Hello world</p>
          {/* </AppTheme> */}
        </div>
      </div>
    </>
  );
}
