import React from "react";

export const Icons = {
  list: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z"/>
    </svg>
  ),
  grid: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M120-120v-320h320v320H120Zm400 0v-320h320v320H520Zm-400-400v-320h320v320H120Zm400 0v-320h320v320H520Z"/>
    </svg>
  ),
  dashboard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M520-200v-280h240v280H520Zm-320-360v-200h240v200H200Zm320-40v-200h240v200H520Zm-320 400v-280h240v280H200Z" />
    </svg>
  ),
  salesLedger: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M280-280h80v-200h-80v200Zm160 0h80v-320h-80v320Zm160 0h80v-440h-80v440ZM120-120v-80h720v80H120Z" />
    </svg>
  ),
  pos: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-560v-160H240v640h480v-480H520ZM240-800v160-160 640-640Z" />
    </svg>
  ),
  payslip: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M480-480q-33 0-56.5-23.5T400-560q0-33 23.5-56.5T480-640q33 0 56.5 23.5T560-560q0 33-23.5 56.5T480-480Zm0 240q-83 0-156-31.5T197-357l33-33q32 28 72.5 44t87.5 16q47 0 87.5-16t72.5-44l33 33q-54 54-127 85.5T480-240ZM160-80v-120h640v120H160Z" />
    </svg>
  ),
  payments: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M200-280v-400h560v400H200Zm80-80h400v-240H280v240Zm-80 160q-33 0-56.5-23.5T120-280v-400q0-33 23.5-56.5T200-800h560q33 0 56.5 23.5T840-720v400q0 33-23.5 56.5T760-120H200Zm80-240v-240 240Z" />
    </svg>
  ),
  bookings: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-32q0-34 17.5-62.5T224-298q62-31 126-46.5t130-15.5q66 0 130 15.5T736-298q29 15 46.5 43.5T800-192v32H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Z" />
    </svg>
  ),
  supplies: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M440-200h80v-167l64 64 56-56-160-160-160 160 56 56 64-64v167ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Z" />
    </svg>
  ),
  services: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M760-120q-33 0-56.5-23.5T680-200q0-8 2-15l-156-90q-21 21-48 33t-58 12q-58 0-101-35.5T262-384H120v-80h142q14-53 57-88.5t101-35.5q31 0 58 12t48 33l156-90q-2-7-2-15 0-33 23.5-56.5T760-840q33 0 56.5 23.5T840-760q0 33-23.5 56.5T760-680ZM420-440q17 0 28.5-11.5T460-480q0-17-11.5-28.5T420-520q-17 0-28.5 11.5T380-480q0 17 11.5 28.5T420-440Z" />
    </svg>
  ),
  add: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  ),
  search: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M784-120 532-372q-30 24-74 38t-90 14q-117 0-198.5-81.5T88-600q0-117 81.5-198.5T368-880q117 0 198.5 81.5T648-600q0 46-14 90t-38 74l252 252-58 58ZM368-240q150 0 255-105t105-255T368-760Z" />
    </svg>
  ),
  delete: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Z" />
    </svg>
  ),
  print: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M640-640v-120H320v120h320Zm-80 400v-80H400v80h160Zm80 80H240v-240h480v240Zm80-240q0-33-23.5-56.5T720-480q-33 0-56.5 23.5T640-400q0 33 23.5 56.5T720-320q33 0 56.5-23.5T800-400ZM80-680v200q0 50 35 85t85 35h40v160q0 33 23.5 56.5T320-80h320q33 0 56.5-23.5T720-160v-160h40q50 0 85-35t35-85Z" />
    </svg>
  ),
  edit: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 -960 960 960" width="18" fill="currentColor" {...props}>
      <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Z" />
    </svg>
  ),
  calendar: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-880h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Z" />
    </svg>
  ),
  cart: (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor" {...props}>
      <path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l66 280h360l76-280H246Z" />
    </svg>
  )
};
