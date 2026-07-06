import { Link } from "react-router-dom";
import Seo from "../components/Seo.jsx";
import livingRoomImage from "../assets/Images/living room.png";
import officeImage from "../assets/Images/office.png";
import mediaWallImage from "../assets/Images/media wall.png";
import hallwayImage from "../assets/Images/hall way.png";

export default function About() {
  return (
    <>
      <Seo
        title="About us"
        description="A decade of UK interiors expertise behind every The British Manor wall panel."
        path="/about"
      />
      <div className="about-hero">
        <img src={livingRoomImage} alt="Feature wall panel installation in a styled interior" />
      </div>
      <div className="container">
        <div className="page-header about-page-header">
          <h1>About The British Manor</h1>
        </div>
        <div className="container-narrow">
          <p className="intro-text" style={{ marginBottom: 65 }}>
            With over a decade of experience in UK interiors, The British Manor brings together
            craftsmanship and contemporary design. Every panel is engineered to elevate your space,
            soften sound, and make a lasting visual statement — all at a price that respects your
            budget.
          </p>
        </div>
      </div>
      <div className="container">
        <div className="about-feature-grid">
          {[
            {
              title: "Add Texture",
              body: "From adding texture to creating focal points, our panels elevate your home while offering practical benefits.",
              img: officeImage,
            },
            {
              title: "No Matter The Space",
              body: "Suit every style and budget — whether you're after acoustic solutions or a sleek finish.",
              img: mediaWallImage,
            },
            {
              title: "Expertly Crafted",
              body: "Built on a decade of expertise — premium materials, modern finishes, and effortless installation.",
              img: hallwayImage,
            },
          ].map((c) => (
            <div key={c.title} className="about-feature-card">
              <img src={c.img} alt="" />
              <h3>{c.title}</h3>
              <p>{c.body}</p>
              <Link to="/collections/products">Shop The Collection</Link>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: 80 }} />
    </>
  );
}
