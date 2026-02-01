import "../Styles/MenuCard.css";

export default function MenuCard({ item, onAdd, viewOnly }) {
  return (
    <div className={`menu-card ${!item.isAvailable ? "disabled" : ""}`}>

      <div className="menu-image">
        <img src={item.imageUrl} alt={item.name} />
        <span className="badge">{item.isVeg ? "Veg" : "Non-Veg"}</span>
      </div>

      <div className="menu-info">
        <h4>{item.name}</h4>
        <p className="price">₹{item.price}</p>

        {!viewOnly && (
          item.isAvailable ? (
            <button onClick={onAdd}>
              ➕ Add
            </button>
          ) : (
            <span className="sold-out">Sold Out</span>
          )
        )}
      </div>
    </div>
  );
}
