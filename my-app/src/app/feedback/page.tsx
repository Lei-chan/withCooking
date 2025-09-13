import Link from "next/link";

export default function Feedback() {
  return (
    <div
      style={{
        backgroundColor: "#b3f8dbff",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2
        style={{
          fontSize: "2vw",
          letterSpacing: "0.1vw",
          wordSpacing: "0.3vw",
          color: "#0d0081ff",
        }}
      >
        Thank you always for using withCooking 🍳✨
      </h2>
      <div
        style={{
          backgroundColor: "#fffc55ff",
          height: "50%",
          width: "60%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          marginTop: "3%",
          borderRadius: "1%/2.2%",
        }}
      >
        <p style={{ fontSize: "1.5vw", lineHeight: "300%" }}>
          It will help if you could send a feedback about this website from
          here!
          <br />
          <Link
            href={""}
            style={{ fontSize: "1.4vw", letterSpacing: "0.07vw" }}
          >
            Feedback from here
          </Link>
          <br />I will keep tryning to make a better website!
        </p>
      </div>
    </div>
  );
}
