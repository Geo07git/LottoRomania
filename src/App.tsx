/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { LotoDashboard } from "./components/loto/LotoDashboard";

export default function App() {
  return (
    <div className="h-screen w-full bg-[#050506] text-[#F5F5F5] flex flex-col font-sans transition-colors duration-300">
      <LotoDashboard />
    </div>
  );
}
