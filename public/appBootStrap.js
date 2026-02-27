import { screenRegistry } from "../routes/screenRegistry.js";

import { DashBoardScreen } from "../components/dashBoard.js";
import { FormViewScreen } from "../components/viewForm.js";
import { UIFormResults } from "../components/formResults.js";
import { CreateForm } from "../components/createForm.js";
import { EditForm } from "../components/editForm.js";

export function bootstrapApplication() {

  // --- Register Screens ---
  screenRegistry.register("dashboard", DashBoardScreen);
  screenRegistry.register("formView", FormViewScreen);
  screenRegistry.register("formResults", UIFormResults);
  screenRegistry.register("formCreate", CreateForm);
  screenRegistry.register("formEdit", EditForm);

}