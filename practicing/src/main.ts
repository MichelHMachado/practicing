import { CountUp } from "countup.js";
import { getRecipes } from "./recipesApi";
import { Recipe } from "./types";

//TODO: SEPARATE CODE INTO MODULES
//TODO: ADD EXTRACT FOR BANK ACCOUNT


const CLASS_TO_TOGGLE = "open";
const triggerElements = Array.from(
  document.querySelectorAll("[data-trigger-element]")
) as Array<HTMLElement>;
const targetElements = document.querySelectorAll<HTMLElement>(".accordion");
const checkBox = document.getElementById("multiselect") as HTMLInputElement;

let isMultiple: boolean;

const toggleClass = (element: HTMLElement, className: string) => {
  element.classList.toggle(className);
};

function createHTMLElement(tagName: string, classNames = [] as string[]) {
  const element = document.createElement(tagName);
  classNames.forEach((className) => element.classList.add(className));
  return element;
}

const openAccordion = (targetElement: HTMLElement) => {
  if (isMultiple) {
    toggleClass(targetElement!, CLASS_TO_TOGGLE);
  } else {
    targetElements.forEach((element) => {
      if (element === targetElement) {
        return;
      }
      element.classList.remove(CLASS_TO_TOGGLE);
    });
    toggleClass(targetElement!, CLASS_TO_TOGGLE);
  }
};

checkBox?.addEventListener("change", () => {
  isMultiple = checkBox.checked;
});

triggerElements.forEach((element, index) => {
  const targetElement = element.parentElement;
  if (index === 0) {
    targetElement?.classList.add(CLASS_TO_TOGGLE);
  }
  element.addEventListener("click", () => {
    openAccordion(targetElement!);
  });
});

/* ACCOUNT START */

const creditButton = document.querySelector(".credit") as HTMLButtonElement;
const debitButton = document.querySelector(".debit") as HTMLButtonElement;
const amountInput = document.getElementById("amount") as HTMLInputElement;
const balanceElement = document.querySelector<HTMLElement>(".balance-value");
let balance = parseFloat(localStorage.getItem("balance") ?? "0");

window.addEventListener("DOMContentLoaded", () => {
  if (balanceElement !== null) {
    balanceElement.innerText = balance
      .toLocaleString("de-DE", { minimumFractionDigits: 2 })
      .toString();
  }
});

class Account {
  balance: number;
  countUp: CountUp;
  constructor(balance: number) {
    this.balance = balance;
    const options = {
      decimalPlaces: 2,
      duration: 1.5,
    };
    this.countUp = new CountUp(balanceElement!, this.balance, options);
  }

  updateBalance(newBalance: number) {
    this.balance = newBalance;

    this.countUp.update(newBalance);
  }

  resetColor() {
    setTimeout(() => {
      balanceElement!.style.color = "";
    }, 1500);
  }

  countUpStart() {
    if (!this.countUp.error) {
      this.countUp.start;
    } else {
      console.log(this.countUp.error);
    }
  }

  credit(amount: number) {
    this.balance += amount;
    localStorage.setItem("balance", this.balance.toString());
    balanceElement!.style.color = "green";
    this.resetColor();
    this.countUpStart();
  }

  debit(amount: number) {
    this.balance -= amount;
    localStorage.setItem("balance", this.balance.toString());
    balanceElement!.style.color = "red";
    this.resetColor();
    this.countUpStart();
  }

  getBalance() {
    return this.balance;
  }
}

const bankAccount = new Account(balance);

debitButton?.addEventListener("click", () => {
  const amount = parseFloat(amountInput?.value);
  if (!isNaN(amount) && amount > 0) {
    if (amount <= balance) {
      amountInput.value = "";
      bankAccount.debit(amount);
      balance = bankAccount.getBalance();
      bankAccount.updateBalance(balance);
    } else {
      alert("Insuficient Funds!");
      amountInput.value = "";
    }
  }
});
creditButton?.addEventListener("click", () => {
  const amount = parseFloat(amountInput?.value);
  if (!isNaN(amount) && amount > 0) {
    amountInput.value = "";
    bankAccount.credit(amount);
    balance = bankAccount.getBalance();
    bankAccount.updateBalance(balance);
  }
});

/* RECIPES */
const recipesButton = document.getElementById("recipes-button");
const recipeInput = recipesButton?.previousElementSibling as HTMLInputElement;

const clearRecipesContainer = () => {
  const recipesContainer = document.querySelector(".recipes");
  if (recipesContainer) {
    recipesContainer.innerHTML = "";
  }
};

const renderRecipe = (recipe: Recipe) => {
  const titleSection = createHTMLElement("div", [
    "title-section",
    "space-between",
    "three-columns",
  ]);

  const recipeTitleMain = createHTMLElement("div");
  recipeTitleMain.classList.add("flex-box");
  const recipeTitle = createHTMLElement("p");
  recipeTitle.textContent = recipe.Title;

  const recipeImage = createHTMLElement("img");
  recipeImage.classList.add("recipe-image");
  recipeImage.setAttribute("src", recipe.Image);

  const accordionIcon = createHTMLElement("div", ["expand-icon"]);

  titleSection.appendChild(recipeTitle);
  titleSection.appendChild(recipeImage);
  titleSection.appendChild(accordionIcon);

  const recipeInstruction = createHTMLElement("p", ["recipe-instruction"]);
  recipeInstruction.textContent = recipe.Instructions;

  const ingredientAccordion = createHTMLElement("div", ["accordion"]);

  const ingredientTitleSection = createHTMLElement("div", [
    "title-section",
    "flex-box",
    "space-between",
  ]);

  ingredientTitleSection.addEventListener("click", () => {
    openAccordion(ingredientAccordion!);
  });

  const ingredientTitle = createHTMLElement("p");
  ingredientTitle.textContent = "Ingredients";

  const ingredientAccordionIcon = createHTMLElement("div", ["expand-icon"]);

  ingredientTitleSection.appendChild(ingredientTitle);
  ingredientTitleSection.appendChild(ingredientAccordionIcon);

  const ingredientContent = createHTMLElement("div", ["description"]);

  const recipeIngredients = createHTMLElement("div");
  for (const [ingredient, description] of Object.entries(recipe.Ingredients)) {
    const ingredientElement = createHTMLElement("p");
    ingredientElement.classList.add("ingredient");
    ingredientElement.textContent = description;
    recipeIngredients.appendChild(ingredientElement);
  }

  ingredientContent.appendChild(recipeIngredients);

  ingredientAccordion.appendChild(ingredientTitleSection);
  ingredientAccordion.appendChild(ingredientContent);

  const descriptionSection = createHTMLElement("div", ["description"]);
  descriptionSection.appendChild(ingredientAccordion);
  descriptionSection.appendChild(recipeInstruction);

  const recipeElement = createHTMLElement("li", ["accordion"]);
  recipeElement.appendChild(titleSection);
  recipeElement.appendChild(descriptionSection);

  titleSection.addEventListener("click", () => {
    openAccordion(recipeElement!);
  });

  return recipeElement;
};

const fetchAndRenderRecipes = async (recipeString: string) => {
  // Check if recipes for the given param exist in localStorage
  const localStorageKey = `recipes_${recipeString}`;
  const localStorageData = localStorage.getItem(localStorageKey);

  if (localStorageData) {
    // If data exists in localStorage, parse it and render the
    console.log("Getting data from localStorage");
    const recipes = JSON.parse(localStorageData);
    clearRecipesContainer();
    renderRecipes(recipes);
  } else {
    // If data doesn't exist in localStorage, fetch from API
    console.log("Getting data from API");
    const recipes = await getRecipes(recipeString.trim());
    // Store the fetched recipes in localStorage
    localStorage.setItem(localStorageKey, JSON.stringify(recipes));
    // Render the fetched recipes
    clearRecipesContainer();
    renderRecipes(recipes);
  }
};

const renderRecipes = (recipes: Recipe[]) => {
  const recipesContainer = document.querySelector(".recipes");
  if (recipesContainer) {
    recipes.forEach((recipe: Recipe) => {
      const recipeElement = renderRecipe(recipe);
      recipesContainer.appendChild(recipeElement);
    });
  }
};

recipesButton?.addEventListener("click", () => {
  const recipeString = recipeInput.value;
  if (recipeString.trim() !== "") {
    fetchAndRenderRecipes(recipeString);
  }

  recipeInput.value = "";
});

recipeInput?.addEventListener("keydown", (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    const recipeString = recipeInput.value;
    if (recipeString.trim() !== "") {
      fetchAndRenderRecipes(recipeString);
    }

    recipeInput.value = "";
  }
});

/* NAV LINKS */

const navLinks = document.querySelectorAll(".nav-menu a");

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });
    link.classList.add("active");
    const attributeValue = link.getAttribute("data-page");
    console.log("attributeValue", attributeValue);
    if (attributeValue) document.body.setAttribute("data-page", attributeValue);
  });
});
