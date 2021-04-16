package ipywebrtc;


import com.twosigma.beakerx.widget.DOMWidget;

public class MediaStream extends DOMWidget {



  public static final String MODEL_MODULE_VALUE = "jupyter-webrtc";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.3.0";
  public static final String MODEL_NAME_VALUE = "MediaStreamModel";
  public static final String VIEW_MODULE_VALUE = "jupyter-webrtc";
  public static final String VIEW_MODULE_VERSION_VALUE = "~0.3.0";
  public static final String VIEW_NAME_VALUE = "MediaStreamView";


  public MediaStream() {
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

}
