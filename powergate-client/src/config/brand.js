/*
  Brand assets.
  Your images live in src/assets (not part of this repo copy). To use a logo image instead of
  the CSS "PG" mark, add the file and swap the two lines below:

    import logo from "assets/images/powergate-logo.png";
    const brand = { logo, markText: "PG", markSubText: "BICKERT MANAGEMENT INC" };

  Webpack fails the build on a missing import, so keep it commented until the file exists.
*/
const brand = {
  logo: null,
  markText: "PG",
  markSubText: "BICKERT MANAGEMENT INC",
};

export default brand;
