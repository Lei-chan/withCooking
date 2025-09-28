// import styles from "./page.module.css";
// import Image from "next/image";

// export default function Loading({ isPending }: { isPending: boolean }) {
//   return (
//     <div
//       style={{
//         position: "fixed",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         top: "0%",
//         left: "0%",
//         width: "100%",
//         height: "100%",
//         backgroundColor: "rgba(255, 174, 0, 1)",
//         zIndex: "100",
//       }}
//     >
//       {isPending ? (
//         <div
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: "15%",
//             width: "30%",
//             height: "40%",
//           }}
//         >
//           <p
//             style={{
//               color: "white",
//               fontSize: "1.8vw",
//               letterSpacing: "0.08vw",
//             }}
//           >
//             Creating your recipe...
//           </p>
//           <Image
//             className={styles.img__uploading}
//             src="/loading.png"
//             alt="loading icon"
//             width={150}
//             height={150}
//           ></Image>
//         </div>
//       ) : (
//         <p
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             textAlign: "center",
//             justifyContent: "center",
//             width: "30%",
//             height: "30%",
//             fontSize: "1.5vw",
//             letterSpacing: "0.05vw",
//             padding: "1%",
//             color: "rgb(197, 118, 0)",
//             backgroundColor: "rgb(255, 254, 205)",
//             borderRadius: "2%/4%",
//           }}
//         >
//           Recipe created successfully!
//         </p>
//       )}
//     </div>
//   );
// }
