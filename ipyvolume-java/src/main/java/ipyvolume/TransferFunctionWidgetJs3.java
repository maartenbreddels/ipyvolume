package ipyvolume;


import com.twosigma.beakerx.widget.Box;
import com.twosigma.beakerx.widget.FloatSlider;
import com.twosigma.beakerx.widget.HBox;
import com.twosigma.beakerx.widget.Label;
import com.twosigma.beakerx.widget.VBox;

import java.util.Arrays;

public class TransferFunctionWidgetJs3 extends TransferFunction {



  public static final String MODEL_MODULE_VALUE = "ipyvolume";
  public static final String MODEL_NAME_VALUE = "TransferFunctionWidgetJs3Model";
  public static final String LEVEL1 = "level1";
  public static final String LEVEL2 = "level2";
  public static final String LEVEL3 = "level3";
  public static final String OPACITY1 = "opacity1";
  public static final String OPACITY2 = "opacity2";
  public static final String OPACITY3 = "opacity3";
  public static final String WIDTH1 = "width1";
  public static final String WIDTH2 = "width2";
  public static final String WIDTH3 = "width3";

  private double level1 = 0.1;
  private double level2 = 0.5;
  private double level3 = 0.8;
  private double opacity1 = 0.01;
  private double opacity2 = 0.05;
  private double opacity3 = 0.1;
  private double width1 = 0.1;
  private double width2 = 0.1;
  private double width3 = 0.1;

  public TransferFunctionWidgetJs3() {
    super();
    openComm();
  }

  public String getModelModuleValue(){
    return MODEL_MODULE_VALUE;
  }

  public String getModelNameValue(){
    return MODEL_NAME_VALUE;
  }

  public double getLevel1() {
    return level1;
  }
  public void setLevel1(double level1){
    this.level1 = level1;
    sendUpdate(LEVEL1, level1);
  }

  public double getLevel2() {
    return level2;
  }
  public void setLevel2(double level2){
    this.level2 = level2;
    sendUpdate(LEVEL2, level2);
  }

  public double getLevel3() {
    return level3;
  }
  public void setLevel3(double level3){
    this.level3 = level3;
    sendUpdate(LEVEL3, level3);
  }

  public double getOpacity1() {
    return opacity1;
  }
  public void setOpacity1(double opacity1){
    this.opacity1 = opacity1;
    sendUpdate(OPACITY1, opacity1);
  }

  public double getOpacity2() {
    return opacity2;
  }
  public void setOpacity2(double opacity2){
    this.opacity2 = opacity2;
    sendUpdate(OPACITY2, opacity2);
  }

  public double getOpacity3() {
    return opacity3;
  }
  public void setOpacity3(double opacity3){
    this.opacity3 = opacity3;
    sendUpdate(OPACITY3, opacity3);
  }

  public double getWidth1() {
    return width1;
  }
  public void setWidth1(double width1){
    this.width1 = width1;
    sendUpdate(WIDTH1, width1);
  }

  public double getWidth2() {
    return width2;
  }
  public void setWidth2(double width2){
    this.width2 = width2;
    sendUpdate(WIDTH2, width2);
  }

  public double getWidth3() {
    return width3;
  }
  public void setWidth3(double width3){
    this.width3 = width3;
    sendUpdate(WIDTH3, width3);
  }

  public Box control(){
    FloatSlider l1 = new FloatSlider();
      l1.setMin(0);
      l1.setMax(1);
      l1.setStep(0.001);
      l1.setValue(level1);
    FloatSlider l2 = new FloatSlider();
      l2.setMin(0);
      l2.setMax(1);
      l2.setStep(0.001);
      l2.setValue(level2);
    FloatSlider l3 = new FloatSlider();
      l3.setMin(0);
      l3.setMax(1);
      l3.setStep(0.001);
      l3.setValue(level3);
    FloatSlider o1 = new FloatSlider();
      o1.setMin(0);
      o1.setMax(1);
      o1.setStep(0.001);
      o1.setValue(opacity1);
    FloatSlider o2 = new FloatSlider();
      o2.setMin(0);
      o2.setMax(1);
      o2.setStep(0.001);
      o2.setValue(opacity2);
    FloatSlider o3 = new FloatSlider();
      o3.setMin(0);
      o3.setMax(1);
      o3.setStep(0.001);
      o3.setValue(opacity3);
    Label label1 = new Label();
    label1.setDescription("Levels");
    Label label2 = new Label();
    label2.setDescription("Opacities");
    return new VBox(Arrays.asList(new HBox(Arrays.asList(label1, l1, l2, l3)), new HBox(Arrays.asList(label2, o1, o2, o3))));
  }

}
