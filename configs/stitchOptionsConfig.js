const stitchOptionsConfig = {

  // ─── MEN'S ───────────────────────────────────────────

  shirt: {
    label: "Shirt",
    sections: [
      { key: "collar", label: "Collar", type: "single",
        options: ["Classic","Mandarin","Button Down","Spread","Band","Cutaway"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Full","Half","Sleeveless"] },
      { key: "cuff_type", label: "Cuff Type", type: "single",
        options: ["Squared","Rounded","French","Barrel"] },
      { key: "pocket", label: "Pocket Type", type: "single",
        options: ["Classic","Square","Round","Flap","No Pocket"] },
      { key: "placket", label: "Placket", type: "single",
        options: ["Front American","French","Consul Flap","Stud","Hidden"] },
      { key: "num_cuffs", label: "Number of Cuffs", type: "counter" },
      { key: "num_collar", label: "Number of Collar", type: "counter" },
      { key: "body_type", label: "Body Type", type: "multi",
        options: ["Big Size","Straight Shoulders","Forward Chest",
                  "Dropped Shoulders","Pot Belly"] },
      { key: "fit", label: "Fit", type: "single",
        options: ["Slim","Regular","Loose"] },
      { key: "lining", label: "Lining", type: "toggle" },
    ]
  },

  pants: {
    label: "Pants",
    sections: [
      { key: "fit", label: "Fit Type", type: "single",
        options: ["Slim","Regular","Loose","Boot Cut","Straight"] },
      { key: "waistband", label: "Waistband", type: "single",
        options: ["Elastic","Belt Loop","Both","Draw String"] },
      { key: "pleat", label: "Pleat", type: "single",
        options: ["No Pleat","Single Pleat","Double Pleat"] },
      { key: "pocket", label: "Pocket Type", type: "multi",
        options: ["Side Pockets","Back Pockets","Coin Pocket","No Pocket"] },
      { key: "hem", label: "Hem Style", type: "single",
        options: ["Plain","Cuffed","Raw"] },
      { key: "zip", label: "Zip Type", type: "single",
        options: ["Metal Zip","Plastic Zip","Hook & Eye","Button"] },
      { key: "body_type", label: "Body Type", type: "multi",
        options: ["Big Size","Pot Belly","Short Height","Long Legs"] },
    ]
  },

  kurta: {
    label: "Kurta",
    sections: [
      { key: "neck", label: "Neck Type", type: "single",
        options: ["Round","V-Neck","Mandarin","Band","U-Neck"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Full","3/4","Half","Sleeveless"] },
      { key: "length", label: "Length", type: "single",
        options: ["Short (Hip)","Medium (Thigh)","Long (Knee)","Extra Long"] },
      { key: "slit", label: "Side Slit", type: "single",
        options: ["No Slit","Small Slit","Medium Slit","Both Sides"] },
      { key: "pocket", label: "Pocket", type: "single",
        options: ["Chest Pocket","Side Pockets","No Pocket"] },
      { key: "fit", label: "Fit", type: "single",
        options: ["Slim","Regular","Loose"] },
      { key: "embroidery", label: "Embroidery", type: "toggle" },
    ]
  },

  sherwani: {
    label: "Sherwani",
    sections: [
      { key: "collar", label: "Collar", type: "single",
        options: ["Mandarin","Band","Nehru","No Collar"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Full","3/4"] },
      { key: "length", label: "Length", type: "single",
        options: ["Knee Length","Below Knee","Ankle Length"] },
      { key: "buttons", label: "Button Style", type: "single",
        options: ["Metal","Fabric","Kundan","Zardozi"] },
      { key: "num_buttons", label: "Number of Buttons", type: "counter" },
      { key: "embroidery", label: "Embroidery Zone", type: "multi",
        options: ["Collar","Cuffs","Front Chest","Full Front","Back"] },
      { key: "lining", label: "Lining", type: "toggle" },
      { key: "fit", label: "Fit", type: "single",
        options: ["Slim","Regular","Loose"] },
    ]
  },

  blazer: {
    label: "Suit / Blazer",
    sections: [
      { key: "lapel", label: "Lapel Type", type: "single",
        options: ["Notch","Peak","Shawl"] },
      { key: "buttons", label: "Button Count", type: "single",
        options: ["1 Button","2 Button","3 Button","Double Breasted"] },
      { key: "vent", label: "Vent", type: "single",
        options: ["No Vent","Single Vent","Double Vent"] },
      { key: "pocket", label: "Pocket Type", type: "multi",
        options: ["Welt","Flap","Ticket Pocket","Breast Pocket"] },
      { key: "sleeve_buttons", label: "Sleeve Buttons", type: "counter" },
      { key: "lining", label: "Lining", type: "single",
        options: ["Full Lined","Half Lined","Unlined"] },
      { key: "fit", label: "Fit", type: "single",
        options: ["Slim","Regular","Loose"] },
    ]
  },

  waistcoat: {
    label: "Waistcoat",
    sections: [
      { key: "neck", label: "Neck Type", type: "single",
        options: ["V-Neck","Round","Shawl Collar","Notch"] },
      { key: "num_buttons", label: "Number of Buttons", type: "counter" },
      { key: "back_style", label: "Back Style", type: "single",
        options: ["Fabric Back","Satin Back","Adjustable Strap"] },
      { key: "pocket", label: "Pocket", type: "multi",
        options: ["Welt Pockets","Chest Pocket","No Pocket"] },
      { key: "lining", label: "Lining", type: "toggle" },
    ]
  },

  dhoti: {
    label: "Dhoti / Veshti",
    sections: [
      { key: "style", label: "Drape Style", type: "single",
        options: ["South Indian","North Indian","Pancha Kacham"] },
      { key: "border", label: "Border Width", type: "single",
        options: ["Thin","Medium","Wide","Extra Wide"] },
      { key: "pleat", label: "Pleat Style", type: "single",
        options: ["Front Pleat","No Pleat","Back Pleat"] },
    ]
  },

  // ─── WOMEN'S ──────────────────────────────────────────

  blouse: {
    label: "Blouse",
    sections: [
      { key: "neck_front", label: "Front Neck", type: "single",
        options: ["Round","Square","Sweetheart","V-Neck","Boat","High Neck"] },
      { key: "neck_back", label: "Back Neck", type: "single",
        options: ["Round","Deep V","Square","Princess Cut","Halter","Open Back"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Sleeveless","Cap Sleeve","Short","Elbow","3/4","Full"] },
      { key: "sleeve_style", label: "Sleeve Style", type: "single",
        options: ["Plain","Bell","Puff","Knotted","Cold Shoulder"] },
      { key: "closure", label: "Closure", type: "single",
        options: ["Hook & Eye","Zip","Button","Drawstring"] },
      { key: "num_hooks", label: "Number of Hooks", type: "counter" },
      { key: "padding", label: "Padding", type: "toggle" },
      { key: "embroidery", label: "Embroidery", type: "multi",
        options: ["None","Neck Border","Sleeves","Full Body","Back"] },
      { key: "fit", label: "Fit", type: "single",
        options: ["Fitted","Regular","Loose"] },
    ]
  },

  salwar: {
    label: "Salwar / Churidar",
    sections: [
      { key: "type", label: "Salwar Type", type: "single",
        options: ["Salwar","Churidar","Plazo","Palazzo","Straight"] },
      { key: "waist", label: "Waist Type", type: "single",
        options: ["Elastic","Drawstring","Zip","Hook"] },
      { key: "pocket", label: "Pocket", type: "single",
        options: ["Side Pockets","No Pocket"] },
      { key: "bottom_cut", label: "Bottom Cut", type: "single",
        options: ["Straight","Flared","Tapered","Anklet"] },
      { key: "body_type", label: "Body Type", type: "multi",
        options: ["Big Size","Short Height","Long Legs","Pot Belly"] },
    ]
  },

  kurti: {
    label: "Kurti",
    sections: [
      { key: "neck", label: "Neck Type", type: "single",
        options: ["Round","V-Neck","Square","U-Neck","Mandarin","Keyhole"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Sleeveless","Short","Elbow","3/4","Full","Cold Shoulder"] },
      { key: "length", label: "Length", type: "single",
        options: ["Short (Hip)","Medium (Thigh)","Knee Length","Ankle Length"] },
      { key: "slit", label: "Side Slit", type: "single",
        options: ["No Slit","Small Slit","Long Slit","Both Sides"] },
      { key: "hem", label: "Hem Shape", type: "single",
        options: ["Straight","Asymmetric","Curved","High-Low","Layered"] },
      { key: "pocket", label: "Pocket", type: "single",
        options: ["Side Pockets","Patch Pocket","No Pocket"] },
      { key: "embroidery", label: "Embroidery", type: "toggle" },
    ]
  },

  lehenga: {
    label: "Lehenga",
    sections: [
      { key: "flair", label: "Flair Type", type: "single",
        options: ["Half Circle","Full Circle","Mermaid","A-Line","Straight"] },
      { key: "waist", label: "Waist Type", type: "single",
        options: ["Drawstring","Zip","Hook & Eye","Elastic"] },
      { key: "layers", label: "Layers", type: "counter" },
      { key: "lining", label: "Lining", type: "toggle" },
      { key: "embroidery", label: "Embroidery Zone", type: "multi",
        options: ["Hem Border","Full Length","Waist Band","None"] },
      { key: "zip", label: "Zip Side", type: "single",
        options: ["Left Side","Right Side","Back","No Zip"] },
    ]
  },

  saree_blouse: {
    label: "Saree Blouse",
    sections: [
      { key: "neck_front", label: "Front Neck", type: "single",
        options: ["Round","Square","Sweetheart","V-Neck","U-Neck","Boat","High Neck"] },
      { key: "neck_back", label: "Back Neck", type: "single",
        options: ["Round Deep","V-Deep","Square","Open Tie","Halter","Princess Cut"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Sleeveless","Cap","Short","Elbow","3/4","Full"] },
      { key: "num_hooks", label: "Number of Hooks", type: "counter" },
      { key: "padding", label: "Padding", type: "toggle" },
      { key: "border", label: "Border Style", type: "single",
        options: ["Matching Saree","Contrast","Embroidered","Plain"] },
      { key: "fit", label: "Fit", type: "single",
        options: ["Fitted","Regular"] },
    ]
  },

  anarkali: {
    label: "Anarkali",
    sections: [
      { key: "neck", label: "Neck Type", type: "single",
        options: ["Round","V-Neck","Square","Sweetheart","High Neck","Keyhole"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Sleeveless","Short","Elbow","3/4","Full"] },
      { key: "flare", label: "Flare Degree", type: "single",
        options: ["Slight","Medium","Heavy","Fish Cut"] },
      { key: "length", label: "Length", type: "single",
        options: ["Knee","Below Knee","Ankle","Floor Length"] },
      { key: "slit", label: "Slit", type: "single",
        options: ["No Slit","Front Slit","Side Slit"] },
      { key: "lining", label: "Lining", type: "toggle" },
      { key: "embroidery", label: "Embroidery Zone", type: "multi",
        options: ["Neck","Bodice","Hem","Full","None"] },
    ]
  },

  gown: {
    label: "Gown",
    sections: [
      { key: "neck", label: "Neck Type", type: "single",
        options: ["Off Shoulder","V-Neck","Square","Halter","High Neck","Strapless"] },
      { key: "sleeve", label: "Sleeve", type: "single",
        options: ["Sleeveless","Cap","Short","Elbow","3/4","Full","Bishop"] },
      { key: "silhouette", label: "Silhouette", type: "single",
        options: ["A-Line","Ball Gown","Mermaid","Sheath","Empire"] },
      { key: "train", label: "Train", type: "single",
        options: ["No Train","Sweep","Chapel","Cathedral"] },
      { key: "closure", label: "Closure", type: "single",
        options: ["Back Zip","Side Zip","Corset","Buttons"] },
      { key: "embellishment", label: "Embellishment", type: "multi",
        options: ["None","Beading","Sequins","Lace","Embroidery","Applique"] },
      { key: "lining", label: "Lining", type: "toggle" },
    ]
  },

  dupatta: {
    label: "Dupatta",
    sections: [
      { key: "border", label: "Border Type", type: "single",
        options: ["Plain","Zari","Lace","Embroidered","Patch Work"] },
      { key: "width", label: "Width", type: "single",
        options: ["Narrow","Standard","Wide"] },
      { key: "embroidery", label: "Embroidery", type: "single",
        options: ["None","Corner","Border","Full"] },
      { key: "tassels", label: "Tassels", type: "toggle" },
      { key: "edging", label: "Edging", type: "single",
        options: ["Plain","Fringe","Lace","Mirror Work"] },
    ]
  },
};

export default stitchOptionsConfig;