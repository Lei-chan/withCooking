import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function DropdownMenu({
  isDropdownVisible,
  onClickDropdown,
}: {
  isDropdownVisible: boolean;
  onClickDropdown: () => void;
}) {
  return (
    <div
      className={styles.container__dropdown}
      style={{ pointerEvents: !isDropdownVisible ? "none" : "all" }}
    >
      <button
        className={styles.btn__dropdown}
        type="button"
        onClick={onClickDropdown}
      ></button>
      <ul
        className={clsx(styles.dropdown_menu)}
        style={{ opacity: !isDropdownVisible ? 0 : 1 }}
      >
        <Link href="http://localhost:3000/recipes">
          <li className={styles.list}>
            <Image
              src={"/recipes.svg"}
              alt="recipe icon"
              width={25}
              height={25}
            ></Image>
            <span>Recipes</span>
          </li>
        </Link>
        <Link href="http://localhost:3000/converter">
          <li className={styles.list}>
            <Image
              src={"/convert.svg"}
              alt="converter icon"
              width={25}
              height={25}
            ></Image>
            <span>Converter</span>
          </li>
        </Link>
        <Link href="http://localhost:3000/account">
          <li className={styles.list}>
            <Image
              src={"/account.svg"}
              alt="account icon"
              width={25}
              height={25}
            ></Image>
            <span>Account</span>
          </li>
        </Link>
        <Link href="http://localhost:3000/news">
          <li className={styles.list}>
            <Image
              src={"/news.svg"}
              alt="news icon"
              width={25}
              height={25}
            ></Image>
            <span>News</span>
          </li>
        </Link>
        <Link href="http://localhost:3000/how-to-use">
          <li className={styles.list}>
            <Image
              src={"/howtouse.svg"}
              alt="how to use icon"
              width={25}
              height={25}
            ></Image>
            <span>How to use</span>
          </li>
        </Link>
        <Link href="http://localhost:3000/feedback">
          <li className={styles.list}>
            <Image
              src={"/feedback.svg"}
              alt="feedback icon"
              width={25}
              height={25}
            ></Image>
            <span>Feedback</span>
          </li>
        </Link>
        <li className={styles.list}>
          <Image
            src={"/logout.svg"}
            alt="logout icon"
            width={25}
            height={25}
          ></Image>
          <span style={{ color: "rgba(233, 4, 4, 1)" }}>Logout</span>
        </li>
      </ul>
    </div>
  );
}
