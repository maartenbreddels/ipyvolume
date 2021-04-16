package ipyvolume;


import com.twosigma.beakerx.widget.DOMWidget;
import com.twosigma.beakerx.widget.Style;

import java.io.Serializable;
import java.util.HashMap;

public class TransferFunction extends DOMWidget {

  public static final String MODEL_MODULE_VALUE = "ipyvolume";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String MODEL_NAME_VALUE = "TransferFunctionModel";
  public static final String VIEW_MODULE_VALUE = "ipyvolume";
  public static final String VIEW_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String VIEW_NAME_VALUE = "TransferFunctionView";
  public static final String RGBA = "rgba";
  public static final String STYLE = "style";
  private Object rgba = null;
  private Style style = null;

  public TransferFunction() {
    super();
    openComm();
  }

  @Override
  public void updateValue(Object value) {

  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  public String getModelModuleVersionValue(){
    return MODEL_MODULE_VERSION_VALUE;
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public String getViewModuleValue(){
    return VIEW_MODULE_VALUE;
  }

  public String getViewModuleVersionValue(){
    return VIEW_MODULE_VERSION_VALUE;
  }

  public String getViewNameValue(){
    return VIEW_NAME_VALUE;
  }

  public Object getRgba() {
    return rgba;
  }
  public void setRgba(Rgba rgba){
    this.rgba = rgba;
    sendUpdate(RGBA, rgba.serializeToJson());
  }

  public Style getStyle() {
    return style;
  }

  public void setStyle(Style style){
    this.style = style;
    sendUpdate(STYLE, style);
  }

}
