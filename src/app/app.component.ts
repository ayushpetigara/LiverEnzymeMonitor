import { formatDate } from '@angular/common';
import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ChartDataSets } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  errorMessage = "";
  title = 'LiverEnzymesMonitor';
  name = "";
  alt_array = [];
  ast_array = [];
  alp_array = [];
  blr_array = [];

  downloadJsonHref: any;

  lineChartData: ChartDataSets[];
  lineChartLabels: Label[];
  lineChartOptions = {}
  lineChartColors: Color[];
  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';

  lastALPValue: number;
  lastASTValue: number;
  lastALTValue: number;
  lastBilirubinValue: number;

  lastALPUnit: string;
  lastASTUnit: string;
  lastALTUnit: string;
  lastBilirubinUnit: string;
  indanger: boolean;

  patient: boolean;
  clinician: boolean;

  patientPhoneNumber = "";

  constructor(private appService: AppService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.appService.getPatientName().subscribe({
      next: d => {
        this.name = d.entry[0].resource.name[0].given;
        this.patientPhoneNumber = d.entry[0].resource.telecom[0].value;


        for (let i = 0; i < d.entry.length; i++) {
          if (d.entry[i].resource.resourceType == "Observation") {
            if (d.entry[i].resource.code.text == "Alanine aminotransferase [Enzymatic activity/volume] in Serum or Plasma") {
              this.alt_array.push(d.entry[i].resource);
            }
            else if (d.entry[i].resource.code.text == "Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma") {
              this.ast_array.push(d.entry[i].resource);
            }
            else if (d.entry[i].resource.code.text == "Alkaline phosphatase [Enzymatic activity/volume] in Serum or Plasma") {
              this.alp_array.push(d.entry[i].resource);
            }
            else if (d.entry[i].resource.code.text == "Bilirubin.total [Mass/volume] in Serum or Plasma") {
              this.blr_array.push(d.entry[i].resource);
            }
          }
        }
        let schemaLog = [];

        for (let i = 0; i < this.alt_array.length; i++) {
          let schema = {};
          schema["alkaline_phosphatase"] = {};
          schema["aspartate_aminotransferase"] = {};
          schema["alanine_aminotransferase"] = {};
          schema["bilirubin"] = {};
          schema["effective_time_frame"] = {};
          schema["alkaline_phosphatase"]["value"] = Number.parseFloat(this.alp_array[i].valueQuantity.value);
          schema["alkaline_phosphatase"]["unit"] = this.alp_array[i].valueQuantity.unit;
          schema["aspartate_aminotransferase"]["value"] = Number.parseFloat(this.ast_array[i].valueQuantity.value);
          schema["aspartate_aminotransferase"]["unit"] = this.ast_array[i].valueQuantity.unit;
          schema["alanine_aminotransferase"]["value"] = Number.parseFloat(this.alt_array[i].valueQuantity.value);
          schema["alanine_aminotransferase"]["unit"] = this.alt_array[i].valueQuantity.unit;
          schema["bilirubin"]["value"] = Number.parseFloat(this.blr_array[i].valueQuantity.value);
          schema["bilirubin"]["unit"] = this.blr_array[i].valueQuantity.unit;
          schema["effective_time_frame"]["date_time"] = this.alt_array[i].effectiveDateTime;
          schemaLog.push(schema);
        }

        console.log(this.alt_array);
        console.log(this.ast_array);

        this.generateDownloadJsonUri(schemaLog);

        this.lineChartLabels = schemaLog.map((d) => {
          return formatDate(d.effective_time_frame["date_time"], "MM-dd-yy", "en-US");
        })

        this.lineChartData = [
          {
            data: schemaLog.map((d) => {
              return d.alkaline_phosphatase["value"]
            }), label: "Alkaline  Phosphatase (ALP)"
          },
          {
            data: schemaLog.map((d) => {
              return d.aspartate_aminotransferase["value"]
            }), label: "Aspartate Aminotransferase (AST)"
          },
          {
            data: schemaLog.map((d) => {
              return d.alanine_aminotransferase["value"]
            }), label: "Alanine Aminotransferase (ALT)"
          },
          {
            data: schemaLog.map((d) => {
              return d.bilirubin["value"]
            }), label: "Bilirubin"
          },
        ];

        this.lineChartColors = [
          {
            backgroundColor: "rgba(255,0,0, 0.05)",
            borderColor: "rgba(255,0,0, 1)",
            pointBackgroundColor: "rgba(225, 225, 225, 1)",
            pointBorderColor: "rgba(246, 71, 64, 1)",
            pointHoverBackgroundColor: "rgba(246, 71, 64, 1)",
            pointHoverBorderColor: "#fff"
          },
          {
            backgroundColor: "rgba(50,205,50, 0.1)",
            borderColor: "rgba(50,205,50, 1)",
            pointBackgroundColor: "rgba(225, 225, 225, 1)",
            pointBorderColor: "rgba(26, 143, 227, 1)",
            pointHoverBackgroundColor: "rgba(26, 143, 227, 1)",
            pointHoverBorderColor: "#fff"
          },
          {
            backgroundColor: "rgba(30,144,255, 0.1)",
            borderColor: "rgba(30,144,255, 1)",
            pointBackgroundColor: "rgba(225, 225, 225, 1)",
            pointBorderColor: "rgba(0,0,205)",
            pointHoverBackgroundColor: "rgba(6, 167, 125, 1)",
            pointHoverBorderColor: "#fff"
          },
          {
            backgroundColor: "rgba(138,43,226, 0.1)",
            borderColor: "rgba(138,43,226, 1)",
            pointBackgroundColor: "rgba(225, 225, 225, 1)",
            pointBorderColor: "rgba(0,0,205)",
            pointHoverBackgroundColor: "rgba(6, 167, 125, 1)",
            pointHoverBorderColor: "#fff"
          },
        ];
        this.lineChartOptions = {
          responsive: true,
        };

        this.lastALPValue = schemaLog[schemaLog.length - 1]["alkaline_phosphatase"]["value"]
        this.lastALPUnit = schemaLog[schemaLog.length - 1]["alkaline_phosphatase"]["unit"]
        this.lastASTValue = schemaLog[schemaLog.length - 1]["aspartate_aminotransferase"]["value"]
        this.lastASTUnit = schemaLog[schemaLog.length - 1]["aspartate_aminotransferase"]["unit"]
        this.lastALTValue = schemaLog[schemaLog.length - 1]["alanine_aminotransferase"]["value"]
        this.lastALTUnit = schemaLog[schemaLog.length - 1]["alanine_aminotransferase"]["unit"]
        this.lastBilirubinValue = schemaLog[schemaLog.length - 1]["bilirubin"]["value"]
        this.lastBilirubinUnit = schemaLog[schemaLog.length - 1]["bilirubin"]["unit"]


      }, error: e => {
        this.errorMessage = e;
      }
    })
  }

  positiveRecommendation() {
    this.indanger = false;
  }
  originalRecommendation() {
    if (this.lastALTValue < 7 || this.lastALTValue > 55 || this.lastASTValue < 8 || this.lastASTValue > 48 || this.lastALPValue < 40 || this.lastALPValue > 129 || this.lastBilirubinValue < 0.1 || this.lastBilirubinValue > 1.2) {
      this.indanger = true;
    }
    else {
      this.indanger = false;
    }
  }

  patientView() {
    this.patient = true;
    this.clinician = false;
  }

  clinicianView() {
    this.patient = false;
    this.clinician = true;
  }

  generateDownloadJsonUri(data) {
    var theJSON = JSON.stringify(data);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadJsonHref = uri;
  }

}
