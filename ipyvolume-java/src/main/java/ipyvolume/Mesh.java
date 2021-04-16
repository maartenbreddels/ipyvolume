package ipyvolume;


import com.twosigma.beakerx.widget.DOMWidget;

public class Mesh extends DOMWidget {



  public static final String MODEL_MODULE_VALUE = "ipyvolume";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String MODEL_NAME_VALUE = "MeshModel";
  public static final String VIEW_MODULE_VALUE = "ipyvolume";
  public static final String VIEW_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String VIEW_NAME_VALUE = "MeshView";
  public static final String SEQUENCE_INDEX = "sequence_index";
  public static final String SIDE = "side";
  public static final String VISIBLE = "visible";
  public static final String VISIBLE_FACES = "visible_faces";
  public static final String VISIBLE_LINES = "visible_lines";

  private int sequenceIndex = Integer.parseInt(null);
  private Object side = "both";
  private boolean visible = true;
  private boolean visibleFaces = true;
  private boolean visibleLines = true;

  public Mesh() {
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

  public int getSequenceIndex() {
    return sequenceIndex;
  }
  public void setSequenceIndex(int sequenceIndex){
    this.sequenceIndex = sequenceIndex;
    sendUpdate(SEQUENCE_INDEX, sequenceIndex);
  }

  public Object getSide() {
    return side;
  }
  public void setSide(Object side){
    this.side = side;
    sendUpdate(SIDE, side);
  }

  public boolean getVisible() {
    return visible;
  }
  public void setVisible(boolean visible){
    this.visible = visible;
    sendUpdate(VISIBLE, visible);
  }

  public boolean getVisibleFaces() {
    return visibleFaces;
  }
  public void setVisibleFaces(boolean visibleFaces){
    this.visibleFaces = visibleFaces;
    sendUpdate(VISIBLE_FACES, visibleFaces);
  }

  public boolean getVisibleLines() {
    return visibleLines;
  }
  public void setVisibleLines(boolean visibleLines){
    this.visibleLines = visibleLines;
    sendUpdate(VISIBLE_LINES, visibleLines);
  }

}
