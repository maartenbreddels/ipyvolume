package ipyvolume;


import java.util.Arrays;
import java.util.List;

public class TransferFunctionJsBumps extends TransferFunction {



  public static final String MODEL_MODULE_VALUE = "ipyvolume";
  public static final String MODEL_NAME_VALUE = "TransferFunctionJsBumpsModel";
  public static final String LEVELS = "levels";
  public static final String OPACITIES = "opacities";
  public static final String WIDTHS = "widths";

  private List levels = Arrays.asList(0.1, 0.5, 0.8);
  private List opacities = Arrays.asList(0.01, 0.05, 0.1);
  private List widths = Arrays.asList(0.1, 0.1, 0.1);

  public TransferFunctionJsBumps() {
    super();
    openComm();
  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public List getLevels() {
    return levels;
  }
  public void setLevels(List levels){
    this.levels = levels;
    sendUpdate(LEVELS, levels);
  }

  public List getOpacities() {
    return opacities;
  }
  public void setOpacities(List opacities){
    this.opacities = opacities;
    sendUpdate(OPACITIES, opacities);
  }

  public List getWidths() {
    return widths;
  }
  public void setWidths(List widths){
    this.widths = widths;
    sendUpdate(WIDTHS, widths);
  }

}
