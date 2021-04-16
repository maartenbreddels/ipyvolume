package ipyvolume;


import com.twosigma.beakerx.widget.Style;
import ipywebrtc.MediaStream;
import org.apache.commons.lang3.ArrayUtils;
import org.assertj.core.internal.Bytes;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.Serializable;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

public class Figure extends MediaStream {



  public static final String MODEL_MODULE_VALUE = "ipyvolume";
  public static final String MODEL_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String MODEL_NAME_VALUE = "FigureModel";
  public static final String VIEW_MODULE_VALUE = "ipyvolume";
  public static final String VIEW_MODULE_VERSION_VALUE = "~0.4.5";
  public static final String VIEW_NAME_VALUE = "FigureView";
  public static final String AMBIENT_COEFFICIENT = "ambient_coefficient";
  public static final String ANGLE_ORDER = "angle_order";
  public static final String ANGLEX = "anglex";
  public static final String ANGLEY = "angley";
  public static final String ANGLEZ = "anglez";
  public static final String ANIMATION = "animation";
  public static final String ANIMATION_EXPONENT = "animation_exponent";
  public static final String CAMERA_CENTER = "camera_center";
  public static final String CAMERA_CONTROL = "camera_control";
  public static final String CAMERA_FOV = "camera_fov";
  public static final String DATA_MAX = "data_max";
  public static final String DATA_MIN = "data_min";
  public static final String DIFFUSE_COEFFICIENT = "diffuse_coefficient";
  public static final String DOWNSCALE = "downscale";
  public static final String EXTENT = "extent";
  public static final String EYE_SEPARATION = "eye_separation";
  public static final String HEIGHT = "height";
  public static final String MATRIX_PROJECTION = "matrix_projection";
  public static final String MATRIX_WORLD = "matrix_world";
  public static final String RENDER_CONTINUOUS = "render_continuous";
  public static final String SELECTION_MODE = "selection_mode";
  public static final String SELECTOR = "selector";
  public static final String SHOW = "show";
  public static final String SPECULAR_COEFFICIENT = "specular_coefficient";
  public static final String SPECULAR_EXPONENT = "specular_exponent";
  public static final String STEREO = "stereo";
  public static final String STYLE = "style";
  public static final String TF = "tf";
  public static final String VOLUME_DATA = "volume_data";
  public static final String WIDTH = "width";
  public static final String XLABEL = "xlabel";
  public static final String XLIM = "xlim";
  public static final String YLABEL = "ylabel";
  public static final String YLIM = "ylim";
  public static final String ZLABEL = "zlabel";
  public static final String ZLIM = "zlim";

  private double ambientCoefficient = 0.5;
  private String angleOrder = "XYZ";
  private double anglex = 0;
  private double angley = 0;
  private double anglez = 0;
  private double animation = 1000;
  private double animationExponent = 0.5;
  private List cameraCenter = Arrays.asList(0, 0, 0);
  private String cameraControl = "trackball";
  private double cameraFov = 45;
  private double dataMax = 0;
  private double dataMin = 0;
  private double diffuseCoefficient = 0.8;
  private int downscale = 1;
  private Object extent = null;
  private double eyeSeparation = 6.4;
  private int height = 400;
  private List matrixProjection = Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  private List matrixWorld = Arrays.asList(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  private boolean renderContinuous = false;
  private String selectionMode = "replace";
  private String selector = "lasso";
  private String show = "Volume";
  private double specularCoefficient = 0.5;
  private double specularExponent = 5;
  private boolean stereo = false;
  private Style style = null;
  private TransferFunction tf = null;
  private int width = 500;
  private String xlabel = "x";
  private List xlim = Arrays.asList(0, 1);
  private String ylabel = "y";
  private List ylim = Arrays.asList(0, 1);
  private String zlabel = "z";
  private List zlim = Arrays.asList(0, 1);
  private VolumeData volumeData;

  public Figure() {
    super();
    openComm();
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

  public double getAmbientCoefficient() {
    return ambientCoefficient;
  }
  public void setAmbientCoefficient(double ambientCoefficient){
    this.ambientCoefficient = ambientCoefficient;
    sendUpdate(AMBIENT_COEFFICIENT, ambientCoefficient);
  }

  public String getAngleOrder() {
    return angleOrder;
  }
  public void setAngleOrder(String angleOrder){
    this.angleOrder = angleOrder;
    sendUpdate(ANGLE_ORDER, angleOrder);
  }

  public double getAnglex() {
    return anglex;
  }
  public void setAnglex(double anglex){
    this.anglex = anglex;
    sendUpdate(ANGLEX, anglex);
  }

  public double getAngley() {
    return angley;
  }
  public void setAngley(double angley){
    this.angley = angley;
    sendUpdate(ANGLEY, angley);
  }

  public double getAnglez() {
    return anglez;
  }
  public void setAnglez(double anglez){
    this.anglez = anglez;
    sendUpdate(ANGLEZ, anglez);
  }

  public double getAnimation() {
    return animation;
  }
  public void setAnimation(double animation){
    this.animation = animation;
    sendUpdate(ANIMATION, animation);
  }

  public double getAnimationExponent() {
    return animationExponent;
  }
  public void setAnimationExponent(double animationExponent){
    this.animationExponent = animationExponent;
    sendUpdate(ANIMATION_EXPONENT, animationExponent);
  }

  public List getCameraCenter() {
    return cameraCenter;
  }
  public void setCameraCenter(List cameraCenter){
    this.cameraCenter = cameraCenter;
    sendUpdate(CAMERA_CENTER, cameraCenter);
  }

  public String getCameraControl() {
    return cameraControl;
  }
  public void setCameraControl(String cameraControl){
    this.cameraControl = cameraControl;
    sendUpdate(CAMERA_CONTROL, cameraControl);
  }

  public double getCameraFov() {
    return cameraFov;
  }
  public void setCameraFov(double cameraFov){
    this.cameraFov = cameraFov;
    sendUpdate(CAMERA_FOV, cameraFov);
  }

  public double getDataMax() {
    return dataMax;
  }
  public void setDataMax(double dataMax){
    this.dataMax = dataMax;
    sendUpdate(DATA_MAX, dataMax);
  }

  public double getDataMin() {
    return dataMin;
  }
  public void setDataMin(double dataMin){
    this.dataMin = dataMin;
    sendUpdate(DATA_MIN, dataMin);
  }

  public double getDiffuseCoefficient() {
    return diffuseCoefficient;
  }
  public void setDiffuseCoefficient(double diffuseCoefficient){
    this.diffuseCoefficient = diffuseCoefficient;
    sendUpdate(DIFFUSE_COEFFICIENT, diffuseCoefficient);
  }

  public int getDownscale() {
    return downscale;
  }
  public void setDownscale(int downscale){
    this.downscale = downscale;
    sendUpdate(DOWNSCALE, downscale);
  }

  public Object getExtent() {
    return extent;
  }
  public void setExtent(Object extent){
    this.extent = extent;
    sendUpdate(EXTENT, extent);
  }

  public double getEyeSeparation() {
    return eyeSeparation;
  }
  public void setEyeSeparation(double eyeSeparation){
    this.eyeSeparation = eyeSeparation;
    sendUpdate(EYE_SEPARATION, eyeSeparation);
  }

  public int getHeight() {
    return height;
  }
  public void setHeight(int height){
    this.height = height;
    sendUpdate(HEIGHT, height);
  }

  public List getMatrixProjection() {
    return matrixProjection;
  }
  public void setMatrixProjection(List matrixProjection){
    this.matrixProjection = matrixProjection;
    sendUpdate(MATRIX_PROJECTION, matrixProjection);
  }

  public List getMatrixWorld() {
    return matrixWorld;
  }
  public void setMatrixWorld(List matrixWorld){
    this.matrixWorld = matrixWorld;
    sendUpdate(MATRIX_WORLD, matrixWorld);
  }

  public boolean getRenderContinuous() {
    return renderContinuous;
  }
  public void setRenderContinuous(boolean renderContinuous){
    this.renderContinuous = renderContinuous;
    sendUpdate(RENDER_CONTINUOUS, renderContinuous);
  }

  public String getSelectionMode() {
    return selectionMode;
  }
  public void setSelectionMode(String selectionMode){
    this.selectionMode = selectionMode;
    sendUpdate(SELECTION_MODE, selectionMode);
  }

  public String getSelector() {
    return selector;
  }
  public void setSelector(String selector){
    this.selector = selector;
    sendUpdate(SELECTOR, selector);
  }

  public String getShow() {
    return show;
  }
  public void setShow(String show){
    this.show = show;
    sendUpdate(SHOW, show);
  }

  public double getSpecularCoefficient() {
    return specularCoefficient;
  }
  public void setSpecularCoefficient(double specularCoefficient){
    this.specularCoefficient = specularCoefficient;
    sendUpdate(SPECULAR_COEFFICIENT, specularCoefficient);
  }

  public double getSpecularExponent() {
    return specularExponent;
  }
  public void setSpecularExponent(double specularExponent){
    this.specularExponent = specularExponent;
    sendUpdate(SPECULAR_EXPONENT, specularExponent);
  }

  public boolean getStereo() {
    return stereo;
  }
  public void setStereo(boolean stereo){
    this.stereo = stereo;
    sendUpdate(STEREO, stereo);
  }

  public Style getStyle() {
    return style;
  }
  public void setStyle(Style style){
    this.style = style;
    sendUpdate(STYLE, style);
  }

  public int getWidth() {
    return width;
  }
  public void setWidth(int width){
    this.width = width;
    sendUpdate(WIDTH, width);
  }

  public String getXlabel() {
    return xlabel;
  }
  public void setXlabel(String xlabel){
    this.xlabel = xlabel;
    sendUpdate(XLABEL, xlabel);
  }

  public List getXlim() {
    return xlim;
  }
  public void setXlim(List xlim){
    this.xlim = xlim;
    sendUpdate(XLIM, xlim);
  }

  public String getYlabel() {
    return ylabel;
  }
  public void setYlabel(String ylabel){
    this.ylabel = ylabel;
    sendUpdate(YLABEL, ylabel);
  }

  public List getYlim() {
    return ylim;
  }
  public void setYlim(List ylim){
    this.ylim = ylim;
    sendUpdate(YLIM, ylim);
  }

  public String getZlabel() {
    return zlabel;
  }
  public void setZlabel(String zlabel){
    this.zlabel = zlabel;
    sendUpdate(ZLABEL, zlabel);
  }

  public List getZlim() {
    return zlim;
  }
  public void setZlim(List zlim){
    this.zlim = zlim;
    sendUpdate(ZLIM, zlim);
  }

  public VolumeData getVolumeData(){
    return volumeData;
  }

  public void setVolumeData(float[][][] volumeData) {

    VolumeData vol = new VolumeData(volumeData);
    this.volumeData = vol;
    sendUpdate(VOLUME_DATA, vol.serializeToJson());
  }

  public TransferFunction getTf() {
    return tf;
  }

  public void setTf(TransferFunction tf) {
    this.tf = tf;
    sendUpdate(TF, "IPY_MODEL_" + tf.getComm().getCommId());
  }
}
