import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import clsx from "clsx";

export default function Home() {
  return (
    <div className={clsx(styles.page__first)}>
      <div className={styles.top_half}>
        <div className={styles.login_signup}>
          <button className={styles.btn__login}>Login</button>
          <button className={styles.btn__signup}>Sign up</button>
        </div>
        <div className={styles.title_description}>
          <Image
            className={styles.title}
            src="/withCooking-title.gif"
            alt="withCooking"
            width={600}
            height={200}
          ></Image>
          <p className={styles.description}>
            In this app, all necessary and useful tools for cooking are
            included.
            <br />
            Store recipes, search your recipes, set multiple timers with titles,
            check nutrients for your recipes, etc.
            <br />
            This simple but userful app will become your cooking buddy :)
          </p>
        </div>
        <div className={styles.scroll}>
          <p>Scroll for more details</p>
          <p>&darr;</p>
        </div>
      </div>
      <div className={styles.bottom_half}>
        <div className={styles.container__details}>
          <h1>Manage your favorite recipes in one app</h1>
          <div
            className={clsx(styles.details, styles.details__right)}
            data-details="0"
          >
            <h2>Create recipes</h2>
            <Image
              src="/grey-img.png"
              alt="create recipe image"
              width={604}
              height={460}
            ></Image>
            <p>
              You can create recipes with simple steps. Nutritional information
              is automatically created for your recipes, so it's useful to
              manage your diet.
              <br />
              You can also automatically convert ingredients/temperature units
              to various types of units, so you don't need to look up for
              different units on the Internet anymore!
            </p>
          </div>
          <div
            className={clsx(styles.details, styles.details__left)}
            data-details="1"
          >
            <h2>Search recipes</h2>
            <Image
              src="/grey-img.png"
              alt="search recipe image"
              width={604}
              height={460}
            ></Image>
            <p>You can search your recipes using keywords.</p>
          </div>
          <div
            className={clsx(styles.details, styles.details__right)}
            data-details="2"
          >
            <h2>Cook with recipes</h2>
            <Image
              src="/grey-img.png"
              alt="recipe image"
              width={604}
              height={460}
            ></Image>
            <p>
              You can edit and leave comments for recipes while cooking, so
              whenever you want to change your recipes, you can easily manage
              it.
            </p>
          </div>
          <div
            className={clsx(styles.details, styles.details__left)}
            data-details="3"
          >
            <h2>Set multiple timers</h2>
            <Image
              src="/grey-img.png"
              alt="setting timers image"
              width={604}
              height={460}
            ></Image>
            <p>
              You can set multiple timers with titles. Even if you aren't good
              at doing multiple cooking process at the same time, this feature
              would become your helper!
            </p>
          </div>
        </div>
        <h3>
          Let's start <span>withCooking</span> by signing up for free
        </h3>
        <footer className={styles.footer}>
          <Link href="https://www.instagram.com/leichanweb?igsh=NzJmb3Axc3ZvNWN6&utm_source=qr">
            <button className={styles.btn__instagram}></button>
          </Link>
          <Link href="https://github.com/Lei-chan">
            <button className={styles.btn__github}></button>
          </Link>
          <Link href="">
            <button className={styles.btn__feedback}></button>
          </Link>
          <p className={styles.attribution}>Designed by Freepik</p>
          <p className={styles.copyright}>© 2025 Lei-chan</p>
        </footer>
      </div>
      <div className={clsx(styles.overlay__first, styles.hidden)}>
        <div className={clsx(styles.overlay__login, styles.hidden)}>
          <p
            className={clsx(
              styles.warning,
              styles.warning__login,
              styles.hidden
            )}
          >
            This account doens't exist. Please try again!
          </p>
          <form className={styles.form__login}>
            <button className={styles.btn__x} type="button">
              &times;
            </button>
            <h2>Login</h2>
            <div className={styles.input_wrapper}>
              <input
                id={styles.input__login_username}
                type="email"
                placeholder="username"
              ></input>
            </div>
            <div className="input_wrapper">
              <input
                id={styles.input__login_password}
                type="password"
                placeholder="password"
              ></input>
              <button className={styles.btn__eye} type="button"></button>
              <button className={styles.btn__eye_off} type="button"></button>
            </div>
            <button className={styles.btn__login} type="submit">
              Log in
            </button>
          </form>
        </div>
        <div className={clsx(styles.overlay__create_account, styles.hidden)}>
          <p
            className={clsx(
              styles.warning,
              styles.warning__create_account,
              styles.hidden
            )}
          >
            This email already exists. Please try again!
          </p>
          <form className={styles.form__create_account}>
            <button className={styles.btn__x} type="button">
              &times;
            </button>
            <h2>Sign-up</h2>
            <h3>Please enter your email address</h3>
            <div className={styles.input_wrapper}>
              <input
                id={styles.input__signup_username}
                type="email"
                placeholder="username"
              ></input>
            </div>
            <h3>Please enter password you want to use</h3>
            <p className={styles.requirements__password}>
              Use 8 letters at minimum including at least
              <br />1 uppercase, 1 lowercase, and 1 digit
            </p>
            <div className={styles.input_wrapper}>
              <input
                id={styles.input__signup_password}
                type="password"
                placeholder="password"
              ></input>
              <button className={styles.btn__eye} type="button"></button>
              <button className={styles.btn__eye_off} type="button"></button>
            </div>
            <button className={styles.btn__signup} type="submit">
              Sign up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// export default function Home() {
//   return (
//     <div className={styles.page}>
//       <main className={styles.main}>
//         <Image
//           className={styles.logo}
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol>
//           <li>
//             Get started by editing <code>src/app/page.tsx</code>.
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className={styles.ctas}>
//           <a
//             className={styles.primary}
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className={styles.logo}
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//             className={styles.secondary}
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className={styles.footer}>
//         <a
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
