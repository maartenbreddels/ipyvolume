package ipyvolume;


import com.twosigma.beakerx.widget.DOMWidget;

import java.util.ArrayList;

public class Scatter extends DOMWidget {



  public static final String MODEL_MODULE_VALUE = "ipyvolume";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String MODEL_NAME_VALUE = "ScatterModel";
  public static final String VIEW_MODULE_VALUE = "ipyvolume";
  public static final String VIEW_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String VIEW_NAME_VALUE = "ScatterView";
  public static final String COLOR_SELECTED = "color_selected";
  public static final String CONNECTED = "connected";
  public static final String GEO = "geo";
  public static final String SEQUENCE_INDEX = "sequence_index";
  public static final String SIZE = "size";
  public static final String SIZE_SELECTED = "size_selected";
  public static final String VISIBLE = "visible";
  public static final String VISIBLE_LINES = "visible_lines";
  public static final String VISIBLE_MARKERS = "visible_markers";

  private Object colorSelected = new ArrayList<>();
  private boolean connected = false;
  private String geo = "diamond";
  private int sequenceIndex = 0;
  private Object size = new ArrayList<>();
  private Object sizeSelected = new ArrayList<>();
  private boolean visible = true;
  private boolean visibleLines = false;
  private boolean visibleMarkers = true;

  public Scatter() {
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

  public Object getColorSelected() {
    return colorSelected;
  }
  public void setColorSelected(Object colorSelected){
    this.colorSelected = colorSelected;
    sendUpdate(COLOR_SELECTED, colorSelected);
  }

  public boolean getConnected() {
    return connected;
  }
  public void setConnected(boolean connected){
    this.connected = connected;
    sendUpdate(CONNECTED, connected);
  }

  public String getGeo() {
    return geo;
  }
  public void setGeo(String geo){
    this.geo = geo;
    sendUpdate(GEO, geo);
  }

  public int getSequenceIndex() {
    return sequenceIndex;
  }
  public void setSequenceIndex(int sequenceIndex){
    this.sequenceIndex = sequenceIndex;
    sendUpdate(SEQUENCE_INDEX, sequenceIndex);
  }

  public Object getSize() {
    return size;
  }
  public void setSize(Object size){
    this.size = size;
    sendUpdate(SIZE, size);
  }

  public Object getSizeSelected() {
    return sizeSelected;
  }
  public void setSizeSelected(Object sizeSelected){
    this.sizeSelected = sizeSelected;
    sendUpdate(SIZE_SELECTED, sizeSelected);
  }

  public boolean getVisible() {
    return visible;
  }
  public void setVisible(boolean visible){
    this.visible = visible;
    sendUpdate(VISIBLE, visible);
  }

  public boolean getVisibleLines() {
    return visibleLines;
  }
  public void setVisibleLines(boolean visibleLines){
    this.visibleLines = visibleLines;
    sendUpdate(VISIBLE_LINES, visibleLines);
  }

  public boolean getVisibleMarkers() {
    return visibleMarkers;
  }
  public void setVisibleMarkers(boolean visibleMarkers){
    this.visibleMarkers = visibleMarkers;
    sendUpdate(VISIBLE_MARKERS, visibleMarkers);
  }

}
