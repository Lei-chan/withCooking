export default function News() {
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
      <h1
        style={{
          fontSize: "2.5vw",
          letterSpacing: "0.1vw",
          color: "#0d0081ff",
        }}
      >
        News
      </h1>
      <div
        style={{
          backgroundColor: "#fffec2ff",
          width: "60%",
          height: "75%",
          marginTop: "2%",
          borderRadius: "1%/1.5%",
          overflow: "hidden",
        }}
      >
        <ul
          style={{
            width: "100%",
            height: "100%",
            overflowY: "scroll",
            overflowX: "hidden",
            scrollbarColor: "#ffb35cff #fffed6ff",
          }}
        >
          <List />
          <List />
          <List />
        </ul>
      </div>
    </div>
  );
}

function List() {
  return (
    <li
      style={{
        backgroundColor: "#fffedfff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "fit-content",
        padding: "3%",
        borderBottom: "thin solid #b3f8dbff",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <span
          style={{
            backgroundColor: "#9b00a0ff",
            color: "orange",
            marginRight: "2%",
            fontSize: "1.1vw",
            letterSpacing: "0.05vw",
            padding: "0.6% 0.8%",
            borderRadius: "50%",
          }}
        >
          New
        </span>
        <h4
          style={{
            fontSize: "1.3vw",
            letterSpacing: "0.1vw",
            color: "blueviolet",
            textDecoration: "blueviolet underline",
          }}
        >
          withCooking is now released!
        </h4>
        <span style={{ position: "absolute", right: "2%", top: "-40%" }}>
          2025/10/10
        </span>
      </div>
      <p
        style={{
          width: "90%",
          height: "fit-content",
          fontSize: "1.25vw",
          letterSpacing: "0.05vw",
          wordSpacing: "0.2vw",
          marginTop: "1%",
          padding: "2%",
          textOverflow: "clip",
        }}
      >
        withCooking was released today! ThanlwithCooking was released
        today!ThanlwithCooking was released today! ThanlwithCooking was released
        today! ThanlwithCooking was released today! ThanlwithCooking was
        released today! ThanlwithCooking was released today! Thanl
      </p>
    </li>
  );
}
