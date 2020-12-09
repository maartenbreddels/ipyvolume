import * as base from "@jupyter-widgets/base";
import * as jupyter_volume from "./index";
import {semver_range} from "./utils";
import {JupyterFrontEnd, JupyterFrontEndPlugin} from '@jupyterlab/application';

const plugin: JupyterFrontEndPlugin<void> = {
  id: "ipyvolume",
  requires: [base.IJupyterWidgetRegistry as any],
  activate(app: JupyterFrontEnd, widgets: base.IJupyterWidgetRegistry) {
      widgets.registerWidget({
          name: "ipyvolume",
          version: semver_range,
          exports: jupyter_volume,
      });
  },
  autoStart: true,
};

export default plugin;
