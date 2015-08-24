07/2015

Giovanni Coppola Laboratory, UCLA

This is to generate files for each module to upload to network browser. ##the files are based on the output from WGCNA analysis for viSant
two types of files required:
(1) module.csv file contains correlation of module eigengenes, and this is ##     for the first page of the browser
(2) csv files for each module

Require files:
(1) module eigengenes output from WGCNA analysis
(2) viSant input files from WGCNA for each module

This is run under R
```
##set work directory
setwd("E:/STUDY/WGCNA_results")

### (1) get module.csv file
##read in ME 
me4cor<-read.csv("ME_output.csv",header=T,row.names=1)
dim(me4cor)

## me4cor <- me4cor [,-17]
## exclude grey if applicable


##get correlation of ME
corME<-cor(me4cor)

mm<-as.vector(rownames(corME))

## make the same format of viSant input

nn=dim(mm)[[1]]

ff<-c(rep(mm,nn))

for (k in 1:nn){
gg<-as.data.frame(cbind(Module=rep(mm[k],nn),corr= corME[,k]))
if (k==1)
hh<- gg
else
hh<-as.data.frame(rbind(hh,gg))
}

cc<-rep("M0039",dim(hh)[[1]])

dd<-as.data.frame(cbind(Module=ff,zero=c(rep(0,nn*nn)),cc, hh))

##exclude connection of modules with itself 
dd0<-dd[abs(dd$corr)>=0 & abs(dd$corr)!=1,]
dim(dd0)
	


dd0<-dd0[order(dd0[,5],decreasing=TRUE),]
##sort in case want to make cutoff

dd0<-dd0[,c(1,4,2,3,5)]
write.table(dd0, "module.csv",sep=",",row.names=F,col.names=F)


### (2) get files for each module

black<-read.table("VisANTInput-black.txt",header=F, fill= TRUE)
dim(black)
black<-black[order(black$V5,decreasing=TRUE),]
dim(black)
write.table(black[1:1500,], "black.csv",sep=",",row.names=F, col.names = F)


## same way to get files for other modules

## alternatively, open in excel for each module, sort the connectivity 
## column, and save as .csv file for the top 1500 pairs if applicable. 


#Note: column 5 (V5) is the connectivity and it must be sorted decreasingly,
Currently the browser allows to upload up to 1500 pairs but only top 500 pairs can be shown.
```

