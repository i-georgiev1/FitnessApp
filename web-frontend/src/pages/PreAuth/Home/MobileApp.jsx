import '../../../styles/MobileButtons.css'

import {
  GooglePlayButton,
  AppGalleryButton,
  ButtonsContainer,
  AppStoreButton,
}
  from "react-mobile-app-button";

export const MobileButton = () => {
  const APKUrl = "https://play.google.com/store/apps/details?id=host";
  const IOSUrl = "https://apps.apple.com/us/app/expo-go/id982107779";
  var width = window.innerWidth;
  if (width >= 1000) {
    var direction = "row";
    var gap = 10;

  }
  else if (width <= 999) {
    var direction = "column";
    var gap = 50;
  };



  return (
    <ButtonsContainer gap={gap} direction={direction} className="buttons-container" >
      <GooglePlayButton
        url={APKUrl}
        theme={"dark"}
        className={"custom-style"}
      />

      <AppGalleryButton
        url={"#hero"}
        theme={"dark"}
        className={"custom-style"}
      />

      <AppStoreButton
        url={IOSUrl}
        theme={"dark"}
        className={"custom-style"}
      />
    </ButtonsContainer>
  );
};