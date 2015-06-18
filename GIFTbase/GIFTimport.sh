#===============================================================================
#
#          FILE:  GIFTimport.sh
#
#         USAGE:  ./GIFTimport.sh vcf_file
#
#   DESCRIPTION: 
#
#       OPTIONS:  ---
#  REQUIREMENTS:  ---
#          BUGS:  ---
#         NOTES:  ---
#        AUTHOR: Yue Qin, YQin@mednet.ucla.edu
#       COMPANY: ICNN, UCLA
#       CREATED: 06/08/2015 09:32:02 PM PDT
#      REVISION:  ---
#===============================================================================


#!/bin/bash

f=$1

echo -e "code \t center \t gene \t chr \t chrstart \t chrend \t ref \t alt \t rsid \t seq_type \t a1 \t a2"

while IFS= read -r line

do
       
        code=`echo $line | awk -F' ' '{print $1}'`
        chr=`echo $line | awk -F' ' '{print $2}'`
        chrstart=`echo $line | awk -F' ' '{print $3}'`
	chrend=$chrstart
	center=' '
	gene=`echo $line | awk -F' ' '{print $9}'| awk -F'Gene.refGene=' '{print $2}'| awk -F';' '{print $1}'`	
	rsid=`echo $line | awk -F' ' '{print $9}'| awk -F'snp138=' '{print $2}'| awk -F';|"' '{print $1}'`

	ind_ref=`echo $line | awk -F' ' '{print $11}' | sed s/\"//g | awk -F':' '{print $1}' | awk -F'/' '{print $1}'`
	ind_alt=`echo $line | awk -F' ' '{print $11}' | sed s/\"//g | awk -F':' '{print $1}' | awk -F'/' '{print $2}'`
	
	ref=`echo $line | awk -F' ' '{print $5}' | sed s/\"//g `
        alt=`echo $line | awk -F' ' '{print $6}' | sed s/\"//g | awk -F',' '{print $'$ind_alt'}'`

	a1=$ref
	a2=$alt

#####################################
	l_ref=`echo $ref | awk '{print length}'`
	l_alt=`echo $alt | awk '{print length}'`
	
	if [ $l_ref -eq $l_alt ] && [ $ref != $alt ]
	then
		seq_type='substitution'
		let chrend=$chrstart+$l_alt-1
		if [ $ind_ref == 1 ]
		then
			a1=$a2
		fi

	elif [ $l_ref -lt $l_alt ]
	then	
		seq_type='insertion'
		let chrstart=$chrstart+$l_ref
		let chrend=$chrstart-1
		if [ $ind_ref == 0 ]
		then
			if [[ ${a2:0:$l_ref} = $a1 ]]		
			then
				a2=${a2#$a1}
				a1='-'
				ref=$a1
				alt=$a2
			fi
		elif [ $ind_ref == 1 ]
		then
			if [[ ${a2:0:$l_ref} = $a1 ]]
                        then
                                a2=${a2#$a1}
				a1=$a2
                                ref='-'
                                alt=$a2
			fi

			
		fi
	elif [ $l_ref -gt $l_alt ]
	then
		seq_type='deletion'
		let chrstart=$chrstart+$l_alt
		let chrend=$chrstart+$l_ref-$l_alt-1
		if [ $ind_ref == 0 ]
                then
			if [[ ${a1:0:$l_alt} = $a2 ]]
			then
				a1=${a1#$a2}
				a2='-'
				ref=$a1
				alt=$a2
			fi
		elif [ $ind_ref == 1 ]
                then
			if [[ ${a1:0:$l_alt} = $a2 ]]
                        then
                                ref=${a1#$a2}
                                alt='-'
                                a1=$alt
                                a2=$alt
                        fi
		fi
		
	else
		seq_type='other'
	fi
#####################################


	echo -e "$code \t $center \t $gene \t chr$chr \t $chrstart \t $chrend \t $ref \t $alt \t $rsid \t $seq_type \t $a1 \t $a2"

done < $f
