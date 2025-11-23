// https://tarkov-market.com/progression/items-to-keep
let itemsToKeep = [];
[...document.getElementsByClassName("table-list")[0].children]
  .filter((x) => JSON.stringify(x.classList) === '{"0":"row"}')
  .forEach((row) => {
    let itemName = row.children[1].children[0].textContent;
    let amountNeeded = (row.children[2].children[0].textContent ?? "").replace(
      "0 / ",
      ""
    );
    let questNeededFor = row.children[3].querySelector("a")?.textContent;

    if (questNeededFor === undefined) {
      questNeededFor = row.children[3].querySelector("span").textContent;
    }

    if (questNeededFor) {
      questNeededFor = questNeededFor
        .replace("01", "")
        .replace("02", "")
        .replace("03", "")
        .replace("04", "")
        .replace("05", "")
        .replace("06", "");
    }

    const requiredInRaid = row.children[5].textContent === "Yes";

    itemsToKeep.push({
      name: itemName,
      quantity: parseInt(amountNeeded),
      task: questNeededFor,
      inRaid: requiredInRaid,
    });
  });
console.log(itemsToKeep);
