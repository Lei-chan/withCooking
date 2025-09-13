const OverlayLoading = function () {
  return (
    <div className={clsx(styles.overlay__upload, styles.hidden)}>
      <Image
        className={clsx(styles.img__uploading, styles.hidden)}
        src="/loading.png"
        alt="loading icon"
        width={150}
        height={150}
      ></Image>
      <p className={clsx(styles.message__upload, styles.hidden)}>
        Recipe uploaded successfully!
      </p>
    </div>
  );
};
