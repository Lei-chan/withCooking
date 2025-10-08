import news from "../lib/models/news";

export default function News() {
  // console.log(new Date().toISOString());
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
            scrollbarColor: "#ffe987ff #fffed6ff",
          }}
        >
          {news.map((news, i) => (
            <List key={i} news={news} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function List({
  news,
}: {
  news: { date: string; title: string; content: string; new: boolean };
}) {
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
        pointerEvents: "none",
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
        {news.new && (
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
        )}
        <h4
          style={{
            fontSize: "1.3vw",
            letterSpacing: "0.1vw",
            color: "blueviolet",
            textDecoration: "blueviolet underline",
          }}
        >
          {news.title}
        </h4>
        <span style={{ position: "absolute", right: "2%", top: "-40%" }}>
          {Intl.DateTimeFormat(navigator.language).format(new Date(news.date))}
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
        {news.content}
      </p>
    </li>
  );
}
